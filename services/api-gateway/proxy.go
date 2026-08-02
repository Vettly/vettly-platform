package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
)

// NewReverseProxy builds a reverse proxy targeting the given backend base URL.
func NewReverseProxy(target *url.URL, corsAllowedOrigin string) *httputil.ReverseProxy {
	proxy := httputil.NewSingleHostReverseProxy(target)

	// NewSingleHostReverseProxy rewrites the request URL but not the Host
	// header, so upstream services would otherwise see the gateway's own
	// hostname. Left unfixed, any upstream logic that builds absolute URLs
	// from the incoming Host (e.g. a redirect) points back at the gateway
	// instead of itself, producing a redirect loop.
	originalDirector := proxy.Director
	proxy.Director = func(r *http.Request) {
		originalDirector(r)
		r.Host = target.Host
	}

	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Printf("proxy error for %s %s -> %s: %v", r.Method, r.URL.Path, target, err)
		setCORSHeaders(w, corsAllowedOrigin)
		http.Error(w, `{"error":"upstream unavailable"}`, http.StatusBadGateway)
	}

	return proxy
}

// matchedRoute finds the longest-prefix RouteRule matching the request path.
// rules must already be sorted by descending prefix length (see BuildRoutes).
func matchedRoute(rules []RouteRule, path string) (RouteRule, bool) {
	for _, rule := range rules {
		if pathHasPrefix(path, rule.Prefix) {
			return rule, true
		}
	}
	return RouteRule{}, false
}

func pathHasPrefix(path, prefix string) bool {
	if len(path) < len(prefix) {
		return false
	}
	if path[:len(prefix)] != prefix {
		return false
	}
	return len(path) == len(prefix) || path[len(prefix)] == '/'
}

// Handler builds the top-level HTTP handler that dispatches requests to the
// matching backend, enforcing JWT auth on protected routes.
func Handler(rules []RouteRule, cfg Config) http.Handler {
	proxies := make(map[*url.URL]*httputil.ReverseProxy, len(rules))
	for _, rule := range rules {
		if rule.Target == nil {
			continue
		}
		if _, ok := proxies[rule.Target]; !ok {
			proxies[rule.Target] = NewReverseProxy(rule.Target, cfg.CORSAllowedOrigin)
		}
	}

	requireAuth := RequireAuth(cfg.JWTSecret, cfg.JWTIssuer, cfg.JWTAudience, cfg.CORSAllowedOrigin)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/health" {
			setCORSHeaders(w, cfg.CORSAllowedOrigin)
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"status":"ok"}`))
			return
		}

		rule, ok := matchedRoute(rules, r.URL.Path)
		if !ok {
			setCORSHeaders(w, cfg.CORSAllowedOrigin)
			http.NotFound(w, r)
			return
		}

		proxy := proxies[rule.Target]

		if rule.Public {
			proxy.ServeHTTP(w, r)
			return
		}

		requireAuth(proxy).ServeHTTP(w, r)
	})
}
