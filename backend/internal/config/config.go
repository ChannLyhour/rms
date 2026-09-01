package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds all application configuration
type Config struct {
	App      AppConfig
	Database DatabaseConfig
	JWT      JWTConfig
}

// AppConfig holds application settings
type AppConfig struct {
	Port        string
	Env         string
	FrontendURL string
}

// DatabaseConfig holds PostgreSQL connection settings
type DatabaseConfig struct {
	Host     string
	Port     string
	Name     string
	User     string
	Password string
	SSLMode  string
	DSN      string
}

// JWTConfig holds JWT signing settings
type JWTConfig struct {
	Secret    string
	ExpiresIn int // hours
}

// Load reads .env file (if present) and returns a populated Config
func Load() (*Config, error) {
	// Search current directory and parent paths for .env
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")
	_ = godotenv.Load("../../.env")

	cfg := &Config{}

	// App
	cfg.App.Port = getEnv("APP_PORT", getEnv("PORT", "8080"))
	cfg.App.Env = getEnv("APP_ENV", "development")
	cfg.App.FrontendURL = getEnv("FRONTEND_URL", "http://localhost:5173")

	// Database
	cfg.Database.Host = getEnv("DB_HOST", "localhost")
	cfg.Database.Port = getEnv("DB_PORT", "5432")
	cfg.Database.Name = getEnv("DB_NAME", "rms")
	cfg.Database.User = getEnv("DB_USER", "postgres")
	cfg.Database.Password = getEnv("DB_PASSWORD", "Hour(14)")
	cfg.Database.SSLMode = getEnv("DB_SSL_MODE", "disable")
	cfg.Database.DSN = fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Bangkok",
		cfg.Database.Host,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.Name,
		cfg.Database.Port,
		cfg.Database.SSLMode,
	)

	// JWT
	cfg.JWT.Secret = getEnv("JWT_SECRET", "super-secret-jwt-key-change-in-production")
	expiresIn, err := strconv.Atoi(getEnv("JWT_EXPIRES_IN_HOURS", "24"))
	if err != nil {
		expiresIn = 24
	}
	cfg.JWT.ExpiresIn = expiresIn

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
