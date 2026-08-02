package main

import (
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// RequireAuth returns a middleware that rejects requests without a valid,
// unexpired JWT signed with the shared HMAC secret. On success it forwards
// the request (including the original Authorization header) unchanged —
// downstream services keep validating the token themselves.
func RequireAuth(secret, issuer, audience, corsAllowedOrigin string) func(http.Handler) http.Handler {
	key := []byte(secret)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenStr := bearerFromHeader(r)
			if tokenStr == "" {
				tokenStr = r.URL.Query().Get("access_token")
			}
			if tokenStr == "" {
				unauthorized(w, corsAllowedOrigin, "missing token")
				return
			}

			_, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
				return key, nil
			},
				jwt.WithValidMethods([]string{"HS256"}),
				jwt.WithIssuer(issuer),
				jwt.WithAudience(audience),
			)
			if err != nil {
				unauthorized(w, corsAllowedOrigin, "invalid token")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func bearerFromHeader(r *http.Request) string {
	auth := r.Header.Get("Authorization")
	const prefix = "Bearer "
	if len(auth) > len(prefix) && strings.EqualFold(auth[:len(prefix)], prefix) {
		return auth[len(prefix):]
	}
	return ""
}

func unauthorized(w http.ResponseWriter, corsAllowedOrigin, msg string) {
	setCORSHeaders(w, corsAllowedOrigin)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusUnauthorized)
	w.Write([]byte(`{"error":"` + msg + `"}`))
}
