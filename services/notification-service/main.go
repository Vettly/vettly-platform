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

	"github.com/redis/go-redis/v9"
)

const eventsChannel = "vettly.events"

func main() {
	cfg, err := LoadConfig()
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	mailer, err := NewMailer(cfg)
	if err != nil {
		log.Fatalf("mailer error: %v", err)
	}

	deps := &Deps{
		Resolver:    NewResolver(cfg),
		Mailer:      mailer,
		FrontendURL: cfg.FrontendURL,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	redisOpts, err := buildRedisOptions(cfg)
	if err != nil {
		log.Fatalf("redis config error: %v", err)
	}

	rdb := redis.NewClient(redisOpts)
	defer rdb.Close()

	pingCtx, cancelPing := context.WithTimeout(ctx, 5*time.Second)
	if err := rdb.Ping(pingCtx).Err(); err != nil {
		cancelPing()
		log.Fatalf("failed to connect to redis at %s: %v", cfg.RedisAddr, err)
	}
	cancelPing()

	pubsub := rdb.Subscribe(ctx, eventsChannel)
	if _, err := pubsub.Receive(ctx); err != nil {
		log.Fatalf("failed to subscribe to %s: %v", eventsChannel, err)
	}
	defer pubsub.Close()

	// Minimal HTTP server so this service can run as a Render Web Service
	// (Render's free tier has no background-worker product) — the actual
	// work still happens in the Redis subscribe loop below.
	healthMux := http.NewServeMux()
	healthMux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})
	healthSrv := &http.Server{Addr: ":" + cfg.Port, Handler: healthMux}

	go func() {
		log.Printf("notification-service health server listening on :%s", cfg.Port)
		if err := healthSrv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("health server error: %v", err)
		}
	}()

	go func() {
		<-ctx.Done()
		pubsub.Close()

		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := healthSrv.Shutdown(shutdownCtx); err != nil {
			log.Printf("health server shutdown failed: %v", err)
		}
	}()

	log.Printf("notification-service listening on redis channel %q", eventsChannel)

	for msg := range pubsub.Channel() {
		HandleMessage(deps, msg.Payload)
	}

	log.Println("notification-service shutting down")
}
