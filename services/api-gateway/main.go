package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	cfg, err := LoadConfig()
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	rules := BuildRoutes(cfg)
	rateLimiter := NewRateLimiter(cfg.RateLimitRPS, cfg.RateLimitBurst, cfg.CORSAllowedOrigin)

	var handler http.Handler = Handler(rules, cfg)
	handler = rateLimiter.Middleware(handler)
	handler = CORSMiddleware(cfg.CORSAllowedOrigin)(handler)
	handler = LoggingMiddleware(handler)

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: handler,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		log.Printf("api-gateway listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server error: %v", err)
		}
	}()

	<-ctx.Done()
	log.Println("api-gateway shutting down")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("graceful shutdown failed: %v", err)
	}
}
