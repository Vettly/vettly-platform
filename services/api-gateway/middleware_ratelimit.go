package main

import (
	"net"
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

const rateLimiterIdleTTL = 5 * time.Minute

type visitor struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// RateLimiter enforces a per-IP token bucket limit. Idle entries are swept
// periodically so memory doesn't grow unbounded over the process lifetime.
type RateLimiter struct {
	rps               rate.Limit
	burst             int
	corsAllowedOrigin string

	mu       sync.Mutex
	visitors map[string]*visitor
}

func NewRateLimiter(rps float64, burst int, corsAllowedOrigin string) *RateLimiter {
	rl := &RateLimiter{
		rps:               rate.Limit(rps),
		burst:             burst,
		corsAllowedOrigin: corsAllowedOrigin,
		visitors:          make(map[string]*visitor),
	}
	go rl.sweep()
	return rl
}

func (rl *RateLimiter) sweep() {
	for {
		time.Sleep(time.Minute)
		rl.mu.Lock()
		for ip, v := range rl.visitors {
			if time.Since(v.lastSeen) > rateLimiterIdleTTL {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}

func (rl *RateLimiter) allow(ip string) bool {
	rl.mu.Lock()
	v, ok := rl.visitors[ip]
	if !ok {
		v = &visitor{limiter: rate.NewLimiter(rl.rps, rl.burst)}
		rl.visitors[ip] = v
	}
	v.lastSeen = time.Now()
	rl.mu.Unlock()

	return v.limiter.Allow()
}

func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := clientIP(r)
		if !rl.allow(ip) {
			setCORSHeaders(w, rl.corsAllowedOrigin)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			w.Write([]byte(`{"error":"rate limit exceeded"}`))
			return
		}
		next.ServeHTTP(w, r)
	})
}

func clientIP(r *http.Request) string {
	if host, _, err := net.SplitHostPort(r.RemoteAddr); err == nil {
		return host
	}
	return r.RemoteAddr
}
