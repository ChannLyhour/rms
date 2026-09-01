package main

import (
	"fmt"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/pos-system/backend/internal/auth"
	"github.com/pos-system/backend/internal/config"
	"github.com/pos-system/backend/internal/database"
	"github.com/pos-system/backend/internal/order"
	"github.com/pos-system/backend/internal/products"
	"github.com/pos-system/backend/internal/system"
	"github.com/pos-system/backend/internal/table"
	"github.com/pos-system/backend/internal/user"
)

func main() {
	// 1. Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("❌ Failed to load configuration: %v", err)
	}

	// 2. Initialize Database Connection
	db, err := database.InitDB(cfg)
	if err != nil {
		log.Fatalf("❌ Failed to initialize database: %v", err)
	}

	// 3. Instantiate Domain Repositories
	userRepo := user.NewRepository(db)
	tableRepo := table.NewRepository(db)
	productRepo := products.NewRepository(db)
	orderRepo := order.NewRepository(db)
	systemRepo := system.NewRepository(db)

	// 4. Instantiate Domain Services
	authSvc := auth.NewService(userRepo, cfg.JWT.Secret, cfg.JWT.ExpiresIn)
	userSvc := user.NewService(userRepo)
	tableSvc := table.NewService(tableRepo, cfg.App.FrontendURL)
	productSvc := products.NewService(productRepo)
	orderSvc := order.NewService(orderRepo, productRepo, systemRepo, 7.0) // default 7% tax

	// 5. Instantiate Domain Handlers
	authHdl := auth.NewHandler(authSvc)
	userHdl := user.NewHandler(userSvc)
	tableHdl := table.NewHandler(tableSvc)
	productHdl := products.NewHandler(productSvc)
	orderHdl := order.NewHandler(orderSvc, tableSvc, productRepo, systemRepo)

	// 6. Gin Router Setup
	if cfg.App.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	// CORS Setup
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Authorization", "Accept", "X-Requested-With"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	r.Use(cors.New(corsConfig))

	// Health Check
	healthHandler := func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "POS System Backend Modular Architecture is running cleanly",
		})
	}
	r.GET("/health", healthHandler)
	r.GET("/api/health", healthHandler)

	// Register API Routes for both /api/v1 and /api
	registerAPIRoutes(r.Group("/api/v1"), cfg, authHdl, userHdl, tableHdl, productHdl, orderHdl)
	registerAPIRoutes(r.Group("/api"), cfg, authHdl, userHdl, tableHdl, productHdl, orderHdl)

	// Start HTTP Server
	addr := fmt.Sprintf(":%s", cfg.App.Port)
	log.Printf("🚀 POS Backend Server listening on http://localhost:%s\n", cfg.App.Port)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Server failed to start: %v\n", err)
	}
}

func registerAPIRoutes(
	api *gin.RouterGroup,
	cfg *config.Config,
	authHdl *auth.Handler,
	userHdl *user.Handler,
	tableHdl *table.Handler,
	productHdl *products.Handler,
	orderHdl *order.Handler,
) {
	// ── Public Auth ──────────────────────────────────────────────
	authGroup := api.Group("/auth")
	{
		authGroup.POST("/login", authHdl.Login)
		authGroup.POST("/logout", authHdl.Logout)
		authGroup.GET("/me", auth.AuthMiddleware(cfg.JWT.Secret), authHdl.Me)
	}
	api.POST("/login", authHdl.Login)
	api.POST("/logout", authHdl.Logout)

	// ── Public Customer QR ───────────────────────────────────────
	customerGroup := api.Group("/customer")
	{
		customerGroup.GET("/menu/:token", orderHdl.GetCustomerMenu)
		customerGroup.POST("/orders/:token", orderHdl.PlaceCustomerOrder)
		customerGroup.GET("/orders/:token/status", orderHdl.GetCustomerOrderStatus)
		customerGroup.POST("/orders/:token/pay-ticket", orderHdl.PayCustomerTicket)
		customerGroup.POST("/call-cashier/:token", orderHdl.CallCashier)
	}

	// ── Protected Cashier Routes ─────────────────────────────────
	cashier := api.Group("/cashier", auth.AuthMiddleware(cfg.JWT.Secret), auth.RequireRole("cashier", "admin"))
	{
		cashier.GET("/tables", tableHdl.ListTables)
		cashier.POST("/sessions", tableHdl.OpenSession)
		cashier.GET("/sessions", tableHdl.ListActiveSessions)
		cashier.DELETE("/sessions/:id", tableHdl.CloseSession)
		cashier.POST("/orders", orderHdl.CreatePOSOrder)
		cashier.GET("/orders", orderHdl.GetOrdersBySession)
		cashier.PATCH("/orders/:id/status", orderHdl.UpdatePOSOrderStatus)
		cashier.POST("/payments", orderHdl.ProcessPayment)
	}

	// ── Protected Kitchen Routes ─────────────────────────────────
	kitchen := api.Group("/kitchen", auth.AuthMiddleware(cfg.JWT.Secret), auth.RequireRole("kitchen", "admin"))
	{
		kitchen.GET("/orders", orderHdl.ListKitchenOrders)
		kitchen.PATCH("/orders/:id/status", orderHdl.UpdateKitchenOrderStatus)
	}

	// ── Protected Admin Routes ───────────────────────────────────
	admin := api.Group("/admin", auth.AuthMiddleware(cfg.JWT.Secret), auth.RequireRole("admin"))
	{
		// Users
		admin.GET("/users", userHdl.ListUsers)
		admin.POST("/users", userHdl.CreateUser)
		admin.PUT("/users/:id", userHdl.UpdateUser)
		admin.DELETE("/users/:id", userHdl.DeleteUser)

		// Roles
		admin.GET("/roles", userHdl.ListRoles)
		admin.POST("/roles", userHdl.CreateRole)
		admin.GET("/roles/:id", userHdl.GetRole)
		admin.PUT("/roles/:id", userHdl.UpdateRole)
		admin.DELETE("/roles/:id", userHdl.DeleteRole)

		// Permissions
		admin.GET("/permissions", userHdl.ListPermissions)
		admin.POST("/permissions/assign", userHdl.AssignPermission)
		admin.POST("/permissions/revoke", userHdl.RevokePermission)

		// Categories & Products
		admin.GET("/categories", productHdl.ListCategories)
		admin.POST("/categories", productHdl.CreateCategory)
		admin.GET("/products", productHdl.ListProducts)
		admin.POST("/products", productHdl.CreateProduct)
		admin.PUT("/products/:id", productHdl.UpdateProduct)
		admin.DELETE("/products/:id", productHdl.DeleteProduct)

		// Options
		admin.GET("/option-groups", productHdl.ListOptionGroups)
		admin.POST("/option-groups", productHdl.CreateOptionGroup)

		// Reports
		admin.GET("/reports/sales", orderHdl.SalesSummaryReport)
	}
}
