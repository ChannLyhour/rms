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

	// Ensure image_url columns are TEXT (prevents 255 character limit errors for long URLs & Base64)
	_ = db.Exec("ALTER TABLE products ALTER COLUMN image_url TYPE TEXT;").Error
	_ = db.Exec("ALTER TABLE categories ALTER COLUMN image_url TYPE TEXT;").Error

	// Normalize any existing /api/uploads/ URLs to /api/v1/uploads/
	_ = db.Exec("UPDATE products SET image_url = REPLACE(image_url, '/api/uploads/', '/api/v1/uploads/') WHERE image_url LIKE '/api/uploads/%';").Error
	_ = db.Exec("UPDATE categories SET image_url = REPLACE(image_url, '/api/uploads/', '/api/v1/uploads/') WHERE image_url LIKE '/api/uploads/%';").Error

	// Rename payments status column to payment_status if it exists
	_ = db.Exec("DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'status') THEN ALTER TABLE payments RENAME COLUMN status TO payment_status; END IF; END $$;").Error

	// Ensure payment_status and payment_method columns exist on orders table
	_ = db.Exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid';").Error
	_ = db.Exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);").Error

	// Ensure accepted_by, accepted_role, accepted_at columns exist on orders table
	_ = db.Exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS accepted_by BIGINT;").Error
	_ = db.Exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS accepted_role VARCHAR(50);").Error
	_ = db.Exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;").Error
	_ = db.Exec("CREATE INDEX IF NOT EXISTS idx_orders_accepted_by ON orders(accepted_by);").Error
	_ = db.Exec("CREATE INDEX IF NOT EXISTS idx_orders_accepted_role ON orders(accepted_role);").Error

	return db, nil
}
