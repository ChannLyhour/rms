package database

import (
	"fmt"
	"log"

	"github.com/pos-system/backend/internal/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

// InitDB connects to the PostgreSQL database using GORM with connection pooling
func InitDB(cfg *config.Config) (*gorm.DB, error) {
	gormCfg := &gorm.Config{}
	if cfg.App.Env == "production" {
		gormCfg.Logger = gormlogger.Default.LogMode(gormlogger.Error)
	} else {
		gormCfg.Logger = gormlogger.Default.LogMode(gormlogger.Warn)
	}

	db, err := gorm.Open(postgres.Open(cfg.Database.DSN), gormCfg)
	if err != nil {
		return nil, fmt.Errorf("failed to open database connection: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	// Set connection pool parameters
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(50)

	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("database ping failed: %w", err)
	}

	log.Printf(" Connected to PostgreSQL Database [%s:%s/%s]\n",
		cfg.Database.Host, cfg.Database.Port, cfg.Database.Name)

	return db, nil
}
