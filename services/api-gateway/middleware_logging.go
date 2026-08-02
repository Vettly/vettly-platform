package main

import (
	"bufio"
	"fmt"
	"log"
	"net"
	"net/http"
	"time"
)

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (rec *statusRecorder) WriteHeader(status int) {
	rec.status = status
	rec.ResponseWriter.WriteHeader(status)
}

// Hijack passes through to the underlying ResponseWriter so WebSocket
// upgrades (e.g. messaging-service's SignalR hub) still work through this
// middleware — without it, httputil.ReverseProxy can't hijack the
// connection and every upgrade fails.
func (rec *statusRecorder) Hijack() (net.Conn, *bufio.ReadWriter, error) {
	hijacker, ok := rec.ResponseWriter.(http.Hijacker)
	if !ok {
		return nil, nil, fmt.Errorf("underlying ResponseWriter does not support hijacking")
	}
	return hijacker.Hijack()
}

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}

		next.ServeHTTP(rec, r)

		log.Printf("%s %s -> %d (%s)", r.Method, r.URL.Path, rec.status, time.Since(start))
	})
}

// setCORSHeaders marks a response as browser-visible from allowedOrigin.
// Use it only on responses the gateway terminates itself (auth rejection,
// rate limiting, no matching route, upstream unreachable) — never on
// proxied pass-through responses, which already carry the backend's own
// Access-Control-Allow-Origin header and would otherwise end up with two.
func setCORSHeaders(w http.ResponseWriter, allowedOrigin string) {
	if allowedOrigin == "" {
		return
	}
	w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
	w.Header().Set("Access-Control-Allow-Credentials", "true")
}

// CORSMiddleware only short-circuits preflight OPTIONS requests, before they
// can reach RequireAuth (a preflight carries no Authorization header, so it
// would otherwise be rejected with 401 for protected routes). It does NOT
// set CORS headers on actual proxied responses — every backend already sets
// its own Access-Control-Allow-* headers via its Cors:AllowedOrigins config,
// and adding a second copy here causes browsers to reject the response
// outright (duplicate Access-Control-Allow-Origin values are invalid).
func CORSMiddleware(allowedOrigin string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == http.MethodOptions {
				if allowedOrigin != "" {
					w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
					w.Header().Set("Access-Control-Allow-Credentials", "true")
					w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
					// Reflect back whatever headers the browser is asking to
					// send (e.g. SignalR's negotiate call adds X-Requested-With)
					// instead of a fixed allowlist that will inevitably miss one.
					if reqHeaders := r.Header.Get("Access-Control-Request-Headers"); reqHeaders != "" {
						w.Header().Set("Access-Control-Allow-Headers", reqHeaders)
					} else {
						w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
					}
				}
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
