package logger

import (
	"log/slog"
	"os"
)

var Log *slog.Logger

// Init initialises the structured logger (JSON in production, text in dev)
func Init(env string) {
	var handler slog.Handler
	if env == "production" {
		handler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})
	} else {
		handler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug})
	}
	Log = slog.New(handler)
	slog.SetDefault(Log)
}
