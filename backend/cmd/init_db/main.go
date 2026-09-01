package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/pos-system/backend/internal/config"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

func findDir(candidates ...string) (string, error) {
	for _, c := range candidates {
		info, err := os.Stat(c)
		if err == nil && info.IsDir() {
			abs, _ := filepath.Abs(c)
			return abs, nil
		}
	}
	return "", fmt.Errorf("directory not found in candidates: %v", candidates)
}

func findFile(candidates ...string) (string, error) {
	for _, c := range candidates {
		info, err := os.Stat(c)
		if err == nil && !info.IsDir() {
			abs, _ := filepath.Abs(c)
			return abs, nil
		}
	}
	return "", fmt.Errorf("file not found in candidates: %v", candidates)
}

func main() {
	fmt.Println("\n===========================================")
	fmt.Println("  📦 POS Database Migration & Seed Runner  ")
	fmt.Println("===========================================")

	// 1. Load config
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("❌ Failed to load configuration: %v", err)
	}

	fmt.Printf("🔌 Connecting to PostgreSQL [%s:%s/%s] as user '%s'...\n",
		cfg.Database.Host, cfg.Database.Port, cfg.Database.Name, cfg.Database.User)

	// 2. Connect DB
	db, err := gorm.Open(postgres.Open(cfg.Database.DSN), &gorm.Config{
		Logger: gormlogger.Default.LogMode(gormlogger.Warn),
	})
	if err != nil {
		log.Fatalf("❌ Database connection failed: %v", err)
	}
	fmt.Println("✅ Connected to PostgreSQL successfully!")

	// 3. Look for migrations directory first (db/migrations)
	migrationsDir, err := findDir(
		"db/migrations",
		"../db/migrations",
		"backend/db/migrations",
		"../../backend/db/migrations",
		"D:/Hunter/exView-reset/backend/db/migrations",
	)

	if err == nil {
		fmt.Printf("📂 Migrations directory found: %s\n", migrationsDir)

		// Create applied_migrations table if not exists
		err = db.Exec(`
			CREATE TABLE IF NOT EXISTS applied_migrations (
				filename    VARCHAR(255) PRIMARY KEY,
				applied_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
			);
		`).Error
		if err != nil {
			log.Fatalf("❌ Failed to initialize applied_migrations table: %v", err)
		}

		entries, err := os.ReadDir(migrationsDir)
		if err != nil {
			log.Fatalf("❌ Failed to read migrations directory: %v", err)
		}

		var upFiles []string
		for _, e := range entries {
			if !e.IsDir() && strings.HasSuffix(e.Name(), ".up.sql") {
				upFiles = append(upFiles, e.Name())
			}
		}
		sort.Strings(upFiles)

		if len(upFiles) > 0 {
			appliedCount := 0
			skippedCount := 0

			for _, fileName := range upFiles {
				var count int64
				db.Table("applied_migrations").Where("filename = ?", fileName).Count(&count)
				if count > 0 {
					fmt.Printf("⏭️  Skipping already applied migration: %s\n", fileName)
					skippedCount++
					continue
				}

				filePath := filepath.Join(migrationsDir, fileName)
				content, err := os.ReadFile(filePath)
				if err != nil {
					log.Fatalf("❌ Failed to read migration file %s: %v", fileName, err)
				}

				tx := db.Begin()
				if err := tx.Exec(string(content)).Error; err != nil {
					tx.Rollback()
					log.Fatalf("❌ Failed to execute migration %s: %v", fileName, err)
				}

				if err := tx.Exec("INSERT INTO applied_migrations (filename) VALUES (?)", fileName).Error; err != nil {
					tx.Rollback()
					log.Fatalf("❌ Failed to record migration %s: %v", fileName, err)
				}

				if err := tx.Commit().Error; err != nil {
					log.Fatalf("❌ Failed to commit migration %s: %v", fileName, err)
				}

				fmt.Printf("✅ Migration applied successfully: %s\n", fileName)
				appliedCount++
			}
			fmt.Printf("\n🎉 Migrations summary: %d applied, %d skipped (already applied)!\n", appliedCount, skippedCount)
		}
	} else {
		// Fallback to monolithic schema.sql and seed.sql
		schemaPath, err := findFile(
			"../database/schema.sql",
			"database/schema.sql",
			"../../database/schema.sql",
			"D:/Hunter/exView-reset/database/schema.sql",
		)
		if err == nil {
			fmt.Printf("📜 Reading schema from: %s\n", schemaPath)
			schemaBytes, err := os.ReadFile(schemaPath)
			if err != nil {
				log.Fatalf("❌ Failed to read schema file: %v", err)
			}
			if err := db.Exec(string(schemaBytes)).Error; err != nil {
				log.Fatalf("❌ Failed to execute schema: %v", err)
			}
			fmt.Println("✅ [1/2] Schema created successfully!")
		}

		seedPath, err := findFile(
			"../database/seeds/seed.sql",
			"database/seeds/seed.sql",
			"../../database/seeds/seed.sql",
			"D:/Hunter/exView-reset/database/seeds/seed.sql",
		)
		if err == nil {
			fmt.Printf("🌱 Reading seed data from: %s\n", seedPath)
			seedBytes, err := os.ReadFile(seedPath)
			if err != nil {
				log.Fatalf("❌ Failed to read seed file: %v", err)
			}
			if err := db.Exec(string(seedBytes)).Error; err != nil {
				log.Fatalf("❌ Failed to execute seed data: %v", err)
			}
			fmt.Println("✅ [2/2] Seed data loaded successfully!")
		}
	}

	// Ensure valid bcrypt hash for 'password' for default users
	validHash, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err == nil {
		_ = db.Exec("UPDATE users SET password = ? WHERE username IN ('admin', 'cashier', 'kitchen')", string(validHash)).Error
	}

	// Summary
	var tableCount, userCount, catCount, prodCount, optCount int64
	db.Table("tables").Count(&tableCount)
	db.Table("users").Count(&userCount)
	db.Table("categories").Count(&catCount)
	db.Table("products").Count(&prodCount)
	db.Table("option_groups").Count(&optCount)

	fmt.Println("\n📊 Database Summary:")
	fmt.Printf("   • Tables:        %d physical restaurant tables\n", tableCount)
	fmt.Printf("   • Users:         %d default accounts (admin, cashier, kitchen)\n", userCount)
	fmt.Printf("   • Categories:    %d menu categories\n", catCount)
	fmt.Printf("   • Products:      %d menu products\n", prodCount)
	fmt.Printf("   • Option Groups: %d option groups with values\n", optCount)

	fmt.Println("\n🎉 Database rms is fully initialized and ready!")
	fmt.Println("===========================================")
}
