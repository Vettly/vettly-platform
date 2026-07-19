package main

import (
	"context"
	"log"
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

	rdb := redis.NewClient(&redis.Options{Addr: cfg.RedisAddr})
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

	go func() {
		<-ctx.Done()
		pubsub.Close()
	}()

	log.Printf("notification-service listening on redis channel %q", eventsChannel)

	for msg := range pubsub.Channel() {
		HandleMessage(deps, msg.Payload)
	}

	log.Println("notification-service shutting down")
}
