package main

import (
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/pos-system/backend/internal/config"
	"github.com/pos-system/backend/internal/inventory"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

type Category struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name      string    `json:"name"`
	IsActive  bool      `json:"is_active"`
	SortOrder int       `json:"sort_order"`
}

func (Category) TableName() string {
	return "categories"
}

type Product struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	CategoryID  uuid.UUID `gorm:"type:uuid;not null" json:"category_id"`
	Name        string    `json:"name"`
	Price       float64   `json:"price"`
	IsAvailable bool      `gorm:"default:true" json:"is_available"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Product) TableName() string {
	return "products"
}

func strPtr(s string) *string {
	return &s
}

func main() {
	fmt.Println("\n========================================================")
	fmt.Println("  🍸 SKYPARK Condotel & Residence Inventory Seeder     ")
	fmt.Println("  Source: reference-skypark (Bar Stock, Costing & Menu) ")
	fmt.Println("========================================================")

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("❌ Failed to load configuration: %v", err)
	}

	db, err := gorm.Open(postgres.Open(cfg.Database.DSN), &gorm.Config{
		Logger: gormlogger.Default.LogMode(gormlogger.Warn),
	})
	if err != nil {
		log.Fatalf("❌ Database connection failed: %v", err)
	}
	fmt.Println("✅ Connected to PostgreSQL successfully!")

	// ── WIPE / CLEAN OLD INVENTORY RECORDS ─────────────────────────
	fmt.Println("\n🧹 Cleaning old inventory data from database...")
	err = db.Exec(`TRUNCATE TABLE ingredient_stock_logs, stock_wastes, purchase_order_items, purchase_orders, recipes, ingredients, suppliers CASCADE;`).Error
	if err != nil {
		log.Fatalf("❌ Failed to truncate tables: %v", err)
	}
	fmt.Println("✅ Old inventory tables cleaned successfully (0 rows remaining)!")

	// ── 0. Seed Categories & Products from Beverage Menu PDF ─────────
	fmt.Println("\n📑 [0/6] Syncing SKYPARK Beverage Menu Products...")

	barCategories := []string{
		"Signature Cocktails",
		"Classic Cocktails",
		"Mocktails & Healthy Drinks",
		"Fresh Juices & Smoothies",
		"Beers (Can & Bottle)",
		"Soft Drinks & Water",
	}

	catMap := make(map[string]uuid.UUID)
	for idx, catName := range barCategories {
		var cat Category
		if err := db.Where("name = ?", catName).First(&cat).Error; err != nil {
			cat = Category{
				ID:        uuid.New(),
				Name:      catName,
				IsActive:  true,
				SortOrder: idx + 1,
			}
			db.Create(&cat)
			fmt.Printf("   ✓ Created Category: %s\n", catName)
		}
		catMap[catName] = cat.ID
	}

	// Products from PDF
	skyparkMenu := []struct {
		catName string
		name    string
		price   float64
	}{
		// Signature Cocktails ($4.00)
		{"Signature Cocktails", "Sky Park Breeze", 4.00},
		{"Signature Cocktails", "Khmer Blossom", 4.00},

		// Classic Cocktails ($4.00 - $5.00)
		{"Classic Cocktails", "Aperol Spritz", 5.00},
		{"Classic Cocktails", "Classic Margarita", 4.00},
		{"Classic Cocktails", "Classic Mojito", 4.00},
		{"Classic Cocktails", "Piña Colada", 4.00},
		{"Classic Cocktails", "Pink Lady", 4.00},

		// Mocktails & Healthy Drinks ($3.00)
		{"Mocktails & Healthy Drinks", "Virgin Mojito", 3.00},
		{"Mocktails & Healthy Drinks", "Fruit Punch", 3.00},
		{"Mocktails & Healthy Drinks", "Shirley Temple", 3.00},
		{"Mocktails & Healthy Drinks", "Virgin Colada", 3.00},

		// Fresh Juices & Smoothies ($1.00 - $2.00)
		{"Fresh Juices & Smoothies", "Fresh Orange Juice", 2.00},
		{"Fresh Juices & Smoothies", "Fresh Passion Juice", 2.00},
		{"Fresh Juices & Smoothies", "Fresh Pineapple Juice", 2.00},
		{"Fresh Juices & Smoothies", "Fresh Lime Juice", 1.00},
		{"Fresh Juices & Smoothies", "Fresh Whole Coconut", 1.50},
		{"Fresh Juices & Smoothies", "Dragon Fruit Smoothie", 2.00},
		{"Fresh Juices & Smoothies", "Passion Fruit Smoothie", 2.00},
		{"Fresh Juices & Smoothies", "Avocado Smoothie", 2.00},

		// Beers ($1.00 - $2.00)
		{"Beers (Can & Bottle)", "Corona Extra (330ml)", 2.00},
		{"Beers (Can & Bottle)", "Heineken Beer (330ml)", 1.00},
		{"Beers (Can & Bottle)", "Hanuman Beer (330ml)", 1.00},
		{"Beers (Can & Bottle)", "Angkor Beer (330ml)", 1.00},
		{"Beers (Can & Bottle)", "Tiger Beer (330ml)", 1.00},

		// Soft Drinks & Water ($1.00)
		{"Soft Drinks & Water", "Coca-Cola Classic", 1.00},
		{"Soft Drinks & Water", "Coca-Cola Light", 1.00},
		{"Soft Drinks & Water", "Sprite", 1.00},
		{"Soft Drinks & Water", "Schweppes Tonic Water", 1.00},
		{"Soft Drinks & Water", "Schweppes Soda Water", 1.00},
		{"Soft Drinks & Water", "Schweppes Ginger Ale", 1.00},
		{"Soft Drinks & Water", "Kulen Mineral Water", 1.00},
	}

	for _, m := range skyparkMenu {
		var p Product
		catID := catMap[m.catName]
		if err := db.Where("name = ?", m.name).First(&p).Error; err != nil {
			p = Product{
				ID:          uuid.New(),
				CategoryID:  catID,
				Name:        m.name,
				Price:       m.price,
				IsAvailable: true,
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			}
			db.Create(&p)
			fmt.Printf("   ✓ Added Menu Product: %s ($%.2f)\n", m.name, m.price)
		}
	}

	// ── 1. Seed 10 Authentic SKYPARK Suppliers ────────────────────
	fmt.Println("\n🏢 [1/6] Seeding 10 SKYPARK F&B Suppliers...")
	suppliersData := []inventory.Supplier{
		{
			ID:            uuid.New(),
			Name:          "Angkor Beverage & Spirits Supply",
			ContactPerson: strPtr("David Vong (Key Account Manager)"),
			Phone:         strPtr("+855 10 999 456"),
			Email:         strPtr("orders@angkorbeverage.com"),
			Address:       strPtr("National Road 6, Sangkat Svay Dangkum, Siem Reap"),
			IsActive:      true,
			CreatedAt:     time.Now().Add(-60 * 24 * time.Hour),
			UpdatedAt:     time.Now(),
		},
		{
			ID:            uuid.New(),
			Name:          "Samai Distillery Cambodia",
			ContactPerson: strPtr("Daniel Pacheco (Master Distiller)"),
			Phone:         strPtr("+855 77 888 333"),
			Email:         strPtr("distillery@samaidistillery.com"),
			Address:       strPtr("St 830, Sangkat Tonle Bassac, Phnom Penh"),
			IsActive:      true,
			CreatedAt:     time.Now().Add(-55 * 24 * time.Hour),
			UpdatedAt:     time.Now(),
		},
		{
			ID:            uuid.New(),
			Name:          "EuroGourmet Import & Spirits Distribution",
			ContactPerson: strPtr("Jean-Marc Laurent (Sales Director)"),
			Phone:         strPtr("+855 92 444 888"),
			Email:         strPtr("logistics@eurogourmet-kh.com"),
			Address:       strPtr("St 240, Sangkat Chaktomuk, Khan Daun Penh, Phnom Penh"),
			IsActive:      true,
			CreatedAt:     time.Now().Add(-50 * 24 * time.Hour),
			UpdatedAt:     time.Now(),
		},
		{
			ID:            uuid.New(),
			Name:          "Heineken Cambodia Brewery Supply",
			ContactPerson: strPtr("Rithy Kim (Commercial Lead)"),
			Phone:         strPtr("+855 23 720 333"),
			Email:         strPtr("orders.kh@heineken.com"),
			Address:       strPtr("Robos Angkanh, Sangkat Prek Eng, Khan Chbar Ampov, Phnom Penh"),
			IsActive:      true,
			CreatedAt:     time.Now().Add(-45 * 24 * time.Hour),
			UpdatedAt:     time.Now(),
		},
		{
			ID:            uuid.New(),
			Name:          "Mekong Fresh Farm & Tropical Fruits Direct",
			ContactPerson: strPtr("Bopha Meng (Farm Operations)"),
			Phone:         strPtr("+855 89 333 777"),
			Email:         strPtr("fresh@mekongorganic.kh"),
			Address:       strPtr("Koki Thom, Kien Svay District, Kandal Province"),
			IsActive:      true,
			CreatedAt:     time.Now().Add(-40 * 24 * time.Hour),
			UpdatedAt:     time.Now(),
		},
		{
			ID:            uuid.New(),
			Name:          "Kulen Mineral Water Cambodia",
			ContactPerson: strPtr("Samnang Prak"),
			Phone:         strPtr("+855 12 555 777"),
			Email:         strPtr("supply@kulenwater.com.kh"),
			Address:       strPtr("Phnom Kulen Source / Sales Office Phnom Penh"),
			IsActive:      true,
			CreatedAt:     time.Now().Add(-38 * 24 * time.Hour),
			UpdatedAt:     time.Now(),
		},
		{
			ID:            uuid.New(),
			Name:          "Monin Gourmet Syrups & Bar Solutions",
			ContactPerson: strPtr("Sophea Nuon (Brand Ambassador)"),
			Phone:         strPtr("+855 16 777 999"),
			Email:         strPtr("monin.kh@gourmetbar.com"),
			Address:       strPtr("St 315, Sangkat Boeung Kak 1, Khan Toul Kork, Phnom Penh"),
			IsActive:      true,
			CreatedAt:     time.Now().Add(-35 * 24 * time.Hour),
			UpdatedAt:     time.Now(),
		},
		{
			ID:            uuid.New(),
			Name:          "Hanuman Beverages Co., Ltd.",
			ContactPerson: strPtr("Vanna Chan"),
			Phone:         strPtr("+855 23 933 888"),
			Email:         strPtr("sales@hanumanbeverages.com"),
			Address:       strPtr("National Road 4, Chbar Mon, Kampong Speu"),
			IsActive:      true,
			CreatedAt:     time.Now().Add(-30 * 24 * time.Hour),
			UpdatedAt:     time.Now(),
		},
		{
			ID:            uuid.New(),
			Name:          "Coconut Cream & Dairy Wholesale (Aroy-D)",
			ContactPerson: strPtr("Chanthy Keo"),
			Phone:         strPtr("+855 12 345 678"),
			Email:         strPtr("orders@aroyd-kh.com"),
			Address:       strPtr("Phsar Derm Kor Wholesale Market, Phnom Penh"),
			IsActive:      true,
			CreatedAt:     time.Now().Add(-25 * 24 * time.Hour),
			UpdatedAt:     time.Now(),
		},
		{
			ID:            uuid.New(),
			Name:          "Phnom Penh Food-Grade Ice & Packaging",
			ContactPerson: strPtr("Kunthea So"),
			Phone:         strPtr("+855 12 777 000"),
			Email:         strPtr("ice.express@pppackaging.com"),
			Address:       strPtr("Russian Federation Blvd, Phnom Penh"),
			IsActive:      true,
			CreatedAt:     time.Now().Add(-20 * 24 * time.Hour),
			UpdatedAt:     time.Now(),
		},
	}

	for _, s := range suppliersData {
		db.Create(&s)
		fmt.Printf("   ✓ Added Supplier: %s\n", s.Name)
	}

	var suppliers []inventory.Supplier
	db.Find(&suppliers)

	// ── 2. Seed Raw Ingredients from SKYPARK Stock & Costing Sheets ──
	fmt.Println("\n📦 [2/6] Seeding SKYPARK Bar Raw Ingredients (Costing & Par Stock)...")

	ingredientsData := []inventory.Ingredient{
		// ── Soft Drinks (from F&B Stock Poolside & Costing Sheet) ──
		{
			ID:                uuid.New(),
			Name:              "Coca-Cola Classic 330ml Can",
			Unit:              "can",
			StockQuantity:     72.000,
			LowStockThreshold: 24.000,
			CostPerUnit:       0.33,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-40 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Coca-Cola Light 330ml Can",
			Unit:              "can",
			StockQuantity:     48.000,
			LowStockThreshold: 24.000,
			CostPerUnit:       0.38,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-40 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Coca-Cola Zero 330ml Can",
			Unit:              "can",
			StockQuantity:     48.000,
			LowStockThreshold: 24.000,
			CostPerUnit:       0.38,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-40 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Sprite 330ml Can",
			Unit:              "can",
			StockQuantity:     48.000,
			LowStockThreshold: 24.000,
			CostPerUnit:       0.31,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-40 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Schweppes Tonic Water 330ml Can",
			Unit:              "can",
			StockQuantity:     48.000,
			LowStockThreshold: 24.000,
			CostPerUnit:       0.33,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-40 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Schweppes Soda Water 330ml Can",
			Unit:              "can",
			StockQuantity:     72.000,
			LowStockThreshold: 24.000,
			CostPerUnit:       0.31,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-40 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Schweppes Ginger Ale 330ml Can",
			Unit:              "can",
			StockQuantity:     36.000,
			LowStockThreshold: 24.000,
			CostPerUnit:       0.33,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-40 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Kulen Mineral Water 500ml",
			Unit:              "bottle",
			StockQuantity:     96.000,
			LowStockThreshold: 24.000,
			CostPerUnit:       0.25,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-40 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},

		// ── Beers (from F&B Stock Poolside) ──
		{
			ID:                uuid.New(),
			Name:              "Tiger Beer 330ml Can",
			Unit:              "can",
			StockQuantity:     72.000,
			LowStockThreshold: 48.000,
			CostPerUnit:       0.65,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-40 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Heineken 330ml Can",
			Unit:              "can",
			StockQuantity:     72.000,
			LowStockThreshold: 48.000,
			CostPerUnit:       0.85,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-40 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Corona Extra 330ml Bottle",
			Unit:              "bottle",
			StockQuantity:     36.000,
			LowStockThreshold: 24.000,
			CostPerUnit:       1.20,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-40 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Hanuman Premium Beer 330ml Can",
			Unit:              "can",
			StockQuantity:     48.000,
			LowStockThreshold: 24.000,
			CostPerUnit:       0.55,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-40 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Angkor Beer 330ml Can",
			Unit:              "can",
			StockQuantity:     48.000,
			LowStockThreshold: 24.000,
			CostPerUnit:       0.50,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-40 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},

		// ── Bar Spirits & Cocktail Ingredients (from Cocktail Recipe sheet) ──
		{
			ID:                uuid.New(),
			Name:              "Samai Premium Khmer Rum",
			Unit:              "L",
			StockQuantity:     8.500,
			LowStockThreshold: 2.000,
			CostPerUnit:       22.00,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-35 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Bacardi White Superior Rum",
			Unit:              "L",
			StockQuantity:     12.000,
			LowStockThreshold: 3.000,
			CostPerUnit:       8.50,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-35 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Malibu Caribbean Coconut Liqueur",
			Unit:              "L",
			StockQuantity:     6.000,
			LowStockThreshold: 2.000,
			CostPerUnit:       11.31,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-35 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Tequila Silver (100% Agave)",
			Unit:              "L",
			StockQuantity:     7.500,
			LowStockThreshold: 2.000,
			CostPerUnit:       9.00,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-35 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Triple Sec Orange Liqueur",
			Unit:              "L",
			StockQuantity:     5.000,
			LowStockThreshold: 1.500,
			CostPerUnit:       11.44,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-35 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Aperol Italian Aperitif",
			Unit:              "L",
			StockQuantity:     6.000,
			LowStockThreshold: 2.000,
			CostPerUnit:       16.00,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-35 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Italian Sparkling Wine (Prosecco)",
			Unit:              "bottle",
			StockQuantity:     18.000,
			LowStockThreshold: 6.000,
			CostPerUnit:       7.50,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-35 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Gordon's London Dry Gin",
			Unit:              "L",
			StockQuantity:     8.000,
			LowStockThreshold: 2.000,
			CostPerUnit:       9.50,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-35 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},

		// ── Mixers, Syrups & Fresh Fruits ──
		{
			ID:                uuid.New(),
			Name:              "Coconut Cream (Kara/Aroy-D)",
			Unit:              "L",
			StockQuantity:     15.000,
			LowStockThreshold: 4.000,
			CostPerUnit:       2.70,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-30 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Fresh Pineapple Juice (100% Pure)",
			Unit:              "L",
			StockQuantity:     20.000,
			LowStockThreshold: 5.000,
			CostPerUnit:       2.00,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-30 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Pure Sugar Syrup (Simple Syrup)",
			Unit:              "L",
			StockQuantity:     25.000,
			LowStockThreshold: 5.000,
			CostPerUnit:       0.64,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-30 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Fresh Lime Juice",
			Unit:              "L",
			StockQuantity:     8.000,
			LowStockThreshold: 2.000,
			CostPerUnit:       3.125,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-30 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Monin Grenadine Syrup",
			Unit:              "L",
			StockQuantity:     4.000,
			LowStockThreshold: 1.000,
			CostPerUnit:       3.20,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-25 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Monin Jasmine Flower Syrup",
			Unit:              "L",
			StockQuantity:     3.500,
			LowStockThreshold: 1.000,
			CostPerUnit:       4.50,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-25 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Monin Mojito Mint Syrup",
			Unit:              "L",
			StockQuantity:     5.000,
			LowStockThreshold: 1.000,
			CostPerUnit:       3.80,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-25 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Fresh Red Dragon Fruit",
			Unit:              "kg",
			StockQuantity:     12.000,
			LowStockThreshold: 3.000,
			CostPerUnit:       1.80,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-20 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Fresh Mint Leaves",
			Unit:              "kg",
			StockQuantity:     2.500, // Trigger Low Stock!
			LowStockThreshold: 4.000,
			CostPerUnit:       2.50,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-20 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Fresh Lemongrass & Kaffir Lime Leaves",
			Unit:              "kg",
			StockQuantity:     5.000,
			LowStockThreshold: 1.500,
			CostPerUnit:       1.20,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-20 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                uuid.New(),
			Name:              "Food Grade Crushed Ice",
			Unit:              "kg",
			StockQuantity:     80.000,
			LowStockThreshold: 20.000,
			CostPerUnit:       0.06,
			IsActive:          true,
			CreatedAt:         time.Now().Add(-15 * 24 * time.Hour),
			UpdatedAt:         time.Now(),
		},
	}

	for _, ing := range ingredientsData {
		db.Create(&ing)
		fmt.Printf("   ✓ Added SKYPARK Ingredient: %s (Stock: %.2f %s @ $%.2f)\n", ing.Name, ing.StockQuantity, ing.Unit, ing.CostPerUnit)
	}

	var allIngredients []inventory.Ingredient
	db.Find(&allIngredients)

	var allProducts []Product
	db.Find(&allProducts)

	findProd := func(name string) *Product {
		for _, p := range allProducts {
			if p.Name == name {
				return &p
			}
		}
		return nil
	}

	findIng := func(name string) *inventory.Ingredient {
		for _, i := range allIngredients {
			if i.Name == name || contains(i.Name, name) {
				return &i
			}
		}
		return nil
	}

	// ── 3. Seed Recipe BOM Formulas (Exact portions from Costing XLS) ──
	fmt.Println("\n🍳 [3/6] Seeding Standard Recipe Formulas (BOM Portions from XLS)...")

	type RecipeItem struct {
		prodName string
		ingName  string
		qty      float64
	}

	recipeBOMs := []RecipeItem{
		// 1. Piña Colada ($4.00) ➔ Recipe Cost: $0.94 (23.5% Cost)
		{"Piña Colada", "Bacardi White", 0.045},
		{"Piña Colada", "Coconut Cream", 0.050},
		{"Piña Colada", "Pure Sugar Syrup", 0.020},
		{"Piña Colada", "Fresh Pineapple Juice", 0.120},
		{"Piña Colada", "Malibu Caribbean", 0.015},
		{"Piña Colada", "Food Grade Crushed Ice", 0.050},

		// 2. Classic Margarita ($4.00) ➔ Recipe Cost: $0.67 (16.7% Cost)
		{"Classic Margarita", "Tequila Silver", 0.040},
		{"Classic Margarita", "Triple Sec Orange", 0.020},
		{"Classic Margarita", "Fresh Lime Juice", 0.020},
		{"Classic Margarita", "Pure Sugar Syrup", 0.020},
		{"Classic Margarita", "Food Grade Crushed Ice", 0.050},

		// 3. Classic Mojito ($4.00) ➔ Recipe Cost: $0.92 (23.0% Cost)
		{"Classic Mojito", "Bacardi White", 0.045},
		{"Classic Mojito", "Pure Sugar Syrup", 0.020},
		{"Classic Mojito", "Fresh Mint Leaves", 0.010},
		{"Classic Mojito", "Fresh Lime Juice", 0.020},
		{"Classic Mojito", "Schweppes Soda Water", 0.300},
		{"Classic Mojito", "Food Grade Crushed Ice", 0.050},

		// 4. Aperol Spritz ($5.00) ➔ Recipe Cost: $1.64 (32.8% Cost)
		{"Aperol Spritz", "Aperol Italian", 0.060},
		{"Aperol Spritz", "Italian Sparkling Wine", 0.120},
		{"Aperol Spritz", "Schweppes Soda Water", 0.100},

		// 5. Sky Park Breeze ($4.00) ➔ Signature Cocktail
		{"Sky Park Breeze", "Samai Premium Khmer", 0.045},
		{"Sky Park Breeze", "Fresh Lemongrass", 0.030},
		{"Sky Park Breeze", "Pure Sugar Syrup", 0.020},
		{"Sky Park Breeze", "Schweppes Soda Water", 0.200},

		// 6. Khmer Blossom ($4.00) ➔ Signature Cocktail
		{"Khmer Blossom", "Samai Premium Khmer", 0.045},
		{"Khmer Blossom", "Fresh Red Dragon", 0.050},
		{"Khmer Blossom", "Monin Jasmine Flower", 0.015},
		{"Khmer Blossom", "Fresh Lime Juice", 0.020},
		{"Khmer Blossom", "Schweppes Soda Water", 0.200},

		// 7. Virgin Mojito ($3.00) ➔ Mocktail
		{"Virgin Mojito", "Fresh Lime Juice", 0.020},
		{"Virgin Mojito", "Monin Mojito Mint", 0.020},
		{"Virgin Mojito", "Fresh Mint Leaves", 0.010},
		{"Virgin Mojito", "Sprite", 0.500},

		// 8. Shirley Temple ($3.00) ➔ Mocktail
		{"Shirley Temple", "Monin Grenadine", 0.020},
		{"Shirley Temple", "Fresh Lime Juice", 0.015},
		{"Shirley Temple", "Sprite", 0.600},

		// 9. Dragon Fruit Smoothie ($2.00)
		{"Dragon Fruit Smoothie", "Fresh Red Dragon", 0.150},
		{"Dragon Fruit Smoothie", "Pure Sugar Syrup", 0.020},
		{"Dragon Fruit Smoothie", "Food Grade Crushed Ice", 0.100},

		// 10. Direct Cans (1:1 Stock Deduction)
		{"Coca-Cola Classic", "Coca-Cola Classic 330ml", 1.000},
		{"Heineken Beer (330ml)", "Heineken 330ml Can", 1.000},
		{"Corona Extra (330ml)", "Corona Extra 330ml", 1.000},
		{"Tiger Beer (330ml)", "Tiger Beer 330ml Can", 1.000},
	}

	for _, b := range recipeBOMs {
		p := findProd(b.prodName)
		ing := findIng(b.ingName)
		if p != nil && ing != nil {
			rec := inventory.Recipe{
				ID:               uuid.New(),
				ProductID:        &p.ID,
				IngredientID:     ing.ID,
				QuantityRequired: b.qty,
				CreatedAt:        time.Now().Add(-20 * 24 * time.Hour),
				UpdatedAt:        time.Now(),
			}
			db.Create(&rec)
			fmt.Printf("   ✓ Linked Recipe BOM: %s ➔ %.3f %s of %s\n", p.Name, b.qty, ing.Unit, ing.Name)
		}
	}

	// ── 4. Seed 10 Inbound SKYPARK Purchase Orders ────────────────
	fmt.Println("\n🚚 [4/6] Seeding 10 SKYPARK Purchase Orders (WAC Ready)...")
	poSeeds := []struct {
		poNum    string
		supName  string
		status   string
		amount   float64
		daysAgo  int
		ingName  string
		orderQty float64
		unitCost float64
	}{
		{"PO-SKP-2026-001", "Angkor Beverage & Spirits Supply", "received", 237.60, 28, "Coca-Cola Classic", 240.000, 0.33},
		{"PO-SKP-2026-002", "EuroGourmet Import", "received", 306.00, 25, "Bacardi White", 36.000, 8.50},
		{"PO-SKP-2026-003", "Samai Distillery", "received", 264.00, 22, "Samai Premium", 12.000, 22.00},
		{"PO-SKP-2026-004", "Heineken Cambodia", "received", 204.00, 18, "Heineken 330ml", 240.000, 0.85},
		{"PO-SKP-2026-005", "Kulen Mineral Water", "received", 60.00, 15, "Kulen Mineral", 240.000, 0.25},
		{"PO-SKP-2026-006", "Monin Gourmet Syrups", "received", 95.00, 12, "Monin Grenadine", 20.000, 3.20},
		{"PO-SKP-2026-007", "Mekong Fresh Farm", "received", 54.00, 9, "Fresh Red Dragon", 30.000, 1.80},
		{"PO-SKP-2026-008", "EuroGourmet Import", "ordered", 180.00, 4, "Aperol Italian", 10.000, 18.00},
		{"PO-SKP-2026-009", "Angkor Beverage & Spirits Supply", "ordered", 148.80, 2, "Schweppes Soda", 480.000, 0.31},
		{"PO-SKP-2026-010", "Coconut Cream & Dairy", "draft", 54.00, 0, "Coconut Cream", 20.000, 2.70},
	}

	for _, p := range poSeeds {
		var sup inventory.Supplier
		db.Where("name ILIKE ?", "%"+p.supName+"%").First(&sup)
		if sup.ID == uuid.Nil && len(suppliers) > 0 {
			sup = suppliers[0]
		}

		ing := findIng(p.ingName)

		var receivedAt *time.Time
		if p.status == "received" {
			t := time.Now().Add(-time.Duration(p.daysAgo) * 24 * time.Hour)
			receivedAt = &t
		}

		dateStr := time.Now().Add(-time.Duration(p.daysAgo-2) * 24 * time.Hour).Format("2006-01-02")

		po := inventory.PurchaseOrder{
			ID:                   uuid.New(),
			PONumber:             p.poNum,
			SupplierID:           sup.ID,
			Status:               p.status,
			TotalAmount:          p.amount,
			ExpectedDeliveryDate: &dateStr,
			ReceivedAt:           receivedAt,
			Notes:                strPtr(fmt.Sprintf("SKYPARK Poolside Bar replenishment order for %s.", p.ingName)),
			CreatedAt:            time.Now().Add(-time.Duration(p.daysAgo) * 24 * time.Hour),
			UpdatedAt:            time.Now().Add(-time.Duration(p.daysAgo) * 24 * time.Hour),
		}
		db.Create(&po)

		if ing != nil {
			item := inventory.PurchaseOrderItem{
				ID:               uuid.New(),
				PurchaseOrderID:  po.ID,
				IngredientID:     &ing.ID,
				QuantityOrdered:  p.orderQty,
				QuantityReceived: func() float64 { if p.status == "received" { return p.orderQty }; return 0 }(),
				UnitCost:         p.unitCost,
				Subtotal:         p.amount,
			}
			db.Create(&item)
		}
		fmt.Printf("   ✓ Created PO: %s (%s) ➔ $%.2f from %s\n", po.PONumber, po.Status, po.TotalAmount, sup.Name)
	}

	// ── 5. Seed 10 Realistic Waste Records (From Excel Lost / Spoil) ──
	fmt.Println("\n⚠️ [5/6] Seeding 10 SKYPARK Waste & Spoilage Logs (Damaged/Spoiled/Mistake)...")
	wasteSeeds := []struct {
		ingName string
		qty     float64
		reason  string
		daysAgo int
	}{
		{"Coca-Cola Classic", 2.000, "damaged", 24},
		{"Corona Extra", 1.000, "damaged", 21},
		{"Fresh Mint Leaves", 1.500, "spoiled", 18},
		{"Fresh Lime Juice", 2.000, "quality", 15},
		{"Bacardi White", 0.045, "mistake", 12},
		{"Coconut Cream", 1.000, "expired", 9},
		{"Fresh Red Dragon", 1.000, "spoiled", 7},
		{"Schweppes Tonic", 2.000, "damaged", 5},
		{"Samai Premium", 0.045, "mistake", 3},
		{"Kulen Mineral Water", 1.000, "damaged", 1},
	}

	for _, w := range wasteSeeds {
		ing := findIng(w.ingName)
		if ing != nil {
			costLoss := w.qty * ing.CostPerUnit
			waste := inventory.StockWaste{
				ID:           uuid.New(),
				IngredientID: &ing.ID,
				Quantity:     w.qty,
				Reason:       w.reason,
				CostLoss:     costLoss,
				CreatedAt:    time.Now().Add(-time.Duration(w.daysAgo) * 24 * time.Hour),
			}
			db.Create(&waste)
			fmt.Printf("   ✓ Logged Waste: %.2f %s of %s (Reason: %s, Loss: $%.2f)\n", w.qty, ing.Unit, ing.Name, w.reason, costLoss)
		}
	}

	// ── 6. Seed 15+ Stock Movement Audit Logs (F&B Stock Poolside) ─
	fmt.Println("\n📜 [6/6] Seeding 16 SKYPARK Movement Audit Logs (Opening, PO, POS, Waste)...")
	logsSeeds := []struct {
		ingName string
		logType string
		qty     float64
		bal     float64
		note    string
		daysAgo int
	}{
		{"Coca-Cola Classic", "po_receive", 240.000, 240.000, "PO #PO-SKP-2026-001 Inbound delivery from Angkor Beverage (10 crates)", 28},
		{"Coca-Cola Classic", "order_deduct", -1.000, 239.000, "POS Sale: Coca-Cola Classic (Order #ORD-2001 Poolside Table 4)", 27},
		{"Coca-Cola Classic", "order_deduct", -2.000, 237.000, "POS Sale: 2x Coca-Cola Classic (Order #ORD-2005 Sunbed 12)", 26},
		{"Coca-Cola Classic", "waste", -2.000, 235.000, "Wastage write-off: 2 cans damaged / dented in delivery", 24},
		{"Bacardi White", "po_receive", 36.000, 36.000, "PO #PO-SKP-2026-002 received: 36L Bacardi White Rum @ $8.50/L", 25},
		{"Bacardi White", "order_deduct", -0.045, 35.955, "POS Recipe Deduct: 1x Piña Colada (Order #ORD-2012)", 24},
		{"Bacardi White", "order_deduct", -0.090, 35.865, "POS Recipe Deduct: 2x Classic Mojito (Order #ORD-2018)", 22},
		{"Samai Premium", "po_receive", 12.000, 12.000, "PO #PO-SKP-2026-003 received: 12L Samai Khmer Rum from Distillery", 22},
		{"Samai Premium", "order_deduct", -0.045, 11.955, "POS Recipe Deduct: 1x Sky Park Breeze Signature (Order #ORD-2025)", 20},
		{"Samai Premium", "order_deduct", -0.045, 11.910, "POS Recipe Deduct: 1x Khmer Blossom Signature (Order #ORD-2030)", 19},
		{"Heineken 330ml", "po_receive", 240.000, 240.000, "PO #PO-SKP-2026-004 received: 10 cases Heineken Cans", 18},
		{"Heineken 330ml", "order_deduct", -4.000, 236.000, "POS Sale: 4x Heineken Beer Bucket (Order #ORD-2042)", 16},
		{"Fresh Mint Leaves", "waste", -1.500, 1.000, "Wastage write-off: 1.500 kg Mint Leaves wilted / spoiled", 18},
		{"Aperol Italian", "po_receive", 6.000, 6.000, "Initial Bar Stock: 6L Aperol Italian Aperitif", 20},
		{"Aperol Italian", "order_deduct", -0.060, 5.940, "POS Recipe Deduct: 1x Aperol Spritz (Order #ORD-2055)", 14},
		{"Corona Extra", "waste", -1.000, 35.000, "Wastage write-off: 1 bottle dropped & broken during bar shift", 21},
	}

	for _, l := range logsSeeds {
		ing := findIng(l.ingName)
		if ing != nil {
			noteStr := l.note
			logRec := inventory.IngredientStockLog{
				ID:            uuid.New(),
				IngredientID:  ing.ID,
				Type:          l.logType,
				Quantity:      l.qty,
				QuantityAfter: l.bal,
				Note:          &noteStr,
				CreatedAt:     time.Now().Add(-time.Duration(l.daysAgo) * 24 * time.Hour),
			}
			db.Create(&logRec)
		}
	}
	fmt.Printf("   ✓ Seeded %d Movement Audit Logs\n", len(logsSeeds))

	fmt.Println("\n========================================================")
	fmt.Println("  🎉 SKYPARK Inventory Data Seeded Cleanly!             ")
	fmt.Println("========================================================\n")
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(substr) > 0 && len(s) > 0 && hasSubstring(s, substr))
}

func hasSubstring(s, sub string) bool {
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}
