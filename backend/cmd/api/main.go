package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/pos-system/backend/internal/auth"
	"github.com/pos-system/backend/internal/config"
	"github.com/pos-system/backend/internal/database"
	"github.com/pos-system/backend/internal/inventory"
	"github.com/pos-system/backend/internal/order"
	"github.com/pos-system/backend/internal/outlet"
	"github.com/pos-system/backend/internal/products"
	"github.com/pos-system/backend/internal/system"
	"github.com/pos-system/backend/internal/table"
	"github.com/pos-system/backend/internal/upload"
	"github.com/pos-system/backend/internal/user"
	"github.com/pos-system/backend/internal/ws"
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
	inventoryRepo := inventory.NewRepository(db)
	systemRepo := system.NewRepository(db)
	outletRepo := outlet.NewRepository(db)

	// 4. Instantiate Domain Services
	authSvc := auth.NewService(userRepo, cfg.JWT.Secret, cfg.JWT.ExpiresIn)
	userSvc := user.NewService(userRepo)
	tableSvc := table.NewService(tableRepo, cfg.App.FrontendURL)
	productSvc := products.NewService(productRepo)
	orderSvc := order.NewService(orderRepo, productRepo, systemRepo, 7.0) // default 7% tax, queries settings table
	inventorySvc := inventory.NewService(inventoryRepo)
	systemSvc := system.NewService(systemRepo)
	outletSvc := outlet.NewService(outletRepo)

	// 5. Instantiate Domain Handlers
	authHdl := auth.NewHandler(authSvc)
	userHdl := user.NewHandler(userSvc)
	tableHdl := table.NewHandler(tableSvc)
	productHdl := products.NewHandler(productSvc)
	orderHdl := order.NewHandler(orderSvc, tableSvc, productRepo, systemRepo)
	inventoryHdl := inventory.NewHandler(inventorySvc)
	systemHdl := system.NewHandler(systemSvc)
	outletHdl := outlet.NewHandler(outletSvc)
	uploadHdl := upload.NewUploadHandler()
	wsHub := ws.NewHub()
	go wsHub.Run()
	
	// Pass wsHub to order.Handler and table.Handler
	orderHdl.SetHub(wsHub)
	tableHdl.SetHub(wsHub)

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

	// Static Uploads Serving
	uploadsDir := upload.GetUploadsDir()
	_ = os.MkdirAll(uploadsDir, 0755)
	r.Static("/uploads", uploadsDir)
	r.Static("/api/uploads", uploadsDir)
	r.Static("/api/v1/uploads", uploadsDir)

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
	registerAPIRoutes(r.Group("/api/v1"), cfg, authHdl, userHdl, tableHdl, productHdl, orderHdl, inventoryHdl, systemHdl, outletHdl, uploadHdl, wsHub)
	registerAPIRoutes(r.Group("/api"), cfg, authHdl, userHdl, tableHdl, productHdl, orderHdl, inventoryHdl, systemHdl, outletHdl, uploadHdl, wsHub)

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
	inventoryHdl *inventory.Handler,
	systemHdl *system.Handler,
	outletHdl *outlet.Handler,
	uploadHdl *upload.UploadHandler,
	wsHub *ws.Hub,
) {
	// ── File Upload Routes ───────────────────────────────────────
	uploadHdl.RegisterRoutes(api)

	// ── Multi-Outlet Routes ──────────────────────────────────────
	outletHdl.RegisterRoutes(api)

	// ── WebSockets ────────────────────────────────────────────────
	api.GET("/ws", func(c *gin.Context) {
		ws.ServeWs(wsHub, c)
	})

	// ── Public Auth (User login returns Bearer Token) ────────────
	authGroup := api.Group("/auth")
	{
		authGroup.POST("/login", authHdl.Login)
		authGroup.POST("/logout", authHdl.Logout)
		authGroup.GET("/me", auth.AuthMiddleware(cfg.JWT.Secret), authHdl.Me)
	}
	api.POST("/login", authHdl.Login)
	api.POST("/logout", authHdl.Logout)

	// ── Public Customer QR Menu & Ordering ──────────────────────
	customerGroup := api.Group("/customer")
	{
		customerGroup.GET("/menu/:token", orderHdl.GetCustomerMenu)
		customerGroup.POST("/orders/:token", orderHdl.PlaceCustomerOrder)
		customerGroup.GET("/orders/:token/status", orderHdl.GetCustomerOrderStatus)
		customerGroup.POST("/orders/:token/pay-ticket", orderHdl.PayCustomerTicket)
		customerGroup.POST("/call-cashier/:token", orderHdl.CallCashier)
	}

	// ── Protected Cashier Routes (Bearer Auth required) ──────────
	cashier := api.Group("/cashier", auth.AuthMiddleware(cfg.JWT.Secret), auth.RequireRoleOrPermission([]string{"cashier", "admin"}, "orders.create", "tables.manage", "payments.process"))
	{
		// Tables & Sessions
		cashier.GET("/tables", tableHdl.ListTables)
		cashier.PATCH("/tables/:id/status", tableHdl.UpdateTableStatus)
		cashier.POST("/sessions", tableHdl.OpenSession)
		cashier.GET("/sessions", tableHdl.ListSessions)
		cashier.GET("/sessions/active", tableHdl.ListActiveSessions)
		cashier.DELETE("/sessions/:id", tableHdl.CloseSession)

		// Orders & Billing
		cashier.POST("/orders", orderHdl.CreatePOSOrder)
		cashier.GET("/orders", orderHdl.GetOrdersBySession)
		cashier.GET("/orders/all", orderHdl.ListOrders)
		cashier.GET("/orders/:id", orderHdl.GetOrderByID)
		cashier.PATCH("/orders/:id/status", orderHdl.UpdatePOSOrderStatus)

		// Payments
		cashier.POST("/payments", orderHdl.ProcessPayment)
		cashier.GET("/payments", orderHdl.ListPayments)
		cashier.GET("/payments/:id", orderHdl.GetPaymentByID)
	}

	// ── Protected Kitchen Routes (Bearer Auth required) ──────────
	kitchen := api.Group("/kitchen", auth.AuthMiddleware(cfg.JWT.Secret), auth.RequireRoleOrPermission([]string{"kitchen", "admin", "cashier"}, "orders.kitchen_view"))
	{
		kitchen.GET("/orders", orderHdl.ListKitchenOrders)
		kitchen.PATCH("/orders/:id/status", orderHdl.UpdateKitchenOrderStatus)
	}

	// ── Staff Read-Only Shared Endpoints (Products, Categories, Modifiers, Settings, Tables) ──
	staff := api.Group("", auth.AuthMiddleware(cfg.JWT.Secret))
	{
		staff.GET("/admin/categories", productHdl.ListCategories)
		staff.GET("/admin/categories/:id", productHdl.GetCategory)
		staff.GET("/admin/products", productHdl.ListProducts)
		staff.GET("/admin/products/:id", productHdl.GetProduct)
		staff.GET("/admin/option-groups", productHdl.ListOptionGroups)
		staff.GET("/admin/option-groups/:id", productHdl.GetOptionGroup)
		staff.GET("/admin/settings", systemHdl.ListSettings)
		staff.GET("/admin/settings/:key", systemHdl.GetSetting)
		staff.GET("/admin/tables", tableHdl.ListTables)
		staff.GET("/admin/tables/:id", tableHdl.GetTable)
		staff.GET("/admin/sessions", tableHdl.ListSessions)
		staff.GET("/admin/orders", orderHdl.ListOrders)
		staff.GET("/admin/orders/:id", orderHdl.GetOrderByID)
		staff.PATCH("/admin/orders/:id/status", orderHdl.UpdatePOSOrderStatus)
		staff.GET("/admin/payments", orderHdl.ListPayments)
		staff.GET("/admin/payments/:id", orderHdl.GetPaymentByID)

		staff.GET("/cashier/categories", productHdl.ListCategories)
		staff.GET("/cashier/products", productHdl.ListProducts)
		staff.GET("/cashier/products/:id", productHdl.GetProduct)
		staff.GET("/cashier/option-groups", productHdl.ListOptionGroups)
	}

	// ── Protected Admin / Management Routes (Bearer Auth required) ────────────
	// 1. Users, Roles & Permissions CRUD
	usersGroup := api.Group("/admin", auth.AuthMiddleware(cfg.JWT.Secret), auth.RequireRoleOrPermission([]string{"admin"}, "users.manage"))
	{
		usersGroup.GET("/users", userHdl.ListUsers)
		usersGroup.GET("/users/:id", userHdl.GetUser)
		usersGroup.POST("/users", userHdl.CreateUser)
		usersGroup.PUT("/users/:id", userHdl.UpdateUser)
		usersGroup.DELETE("/users/:id", userHdl.DeleteUser)

		usersGroup.GET("/roles", userHdl.ListRoles)
		usersGroup.GET("/roles/:id", userHdl.GetRole)
		usersGroup.POST("/roles", userHdl.CreateRole)
		usersGroup.PUT("/roles/:id", userHdl.UpdateRole)
		usersGroup.DELETE("/roles/:id", userHdl.DeleteRole)
		usersGroup.GET("/permissions", userHdl.ListPermissions)
		usersGroup.POST("/roles/permissions", userHdl.AssignPermission)
		usersGroup.DELETE("/roles/permissions", userHdl.RevokePermission)
	}

	// 2. Menu & Catalog Mutations (Products, Categories, Options)
	menuGroup := api.Group("/admin", auth.AuthMiddleware(cfg.JWT.Secret), auth.RequireRoleOrPermission([]string{"admin"}, "menu.manage"))
	{
		menuGroup.POST("/categories", productHdl.CreateCategory)
		menuGroup.PUT("/categories/:id", productHdl.UpdateCategory)
		menuGroup.DELETE("/categories/:id", productHdl.DeleteCategory)

		menuGroup.POST("/products", productHdl.CreateProduct)
		menuGroup.PUT("/products/:id", productHdl.UpdateProduct)
		menuGroup.DELETE("/products/:id", productHdl.DeleteProduct)

		menuGroup.POST("/option-groups", productHdl.CreateOptionGroup)
		menuGroup.PUT("/option-groups/:id", productHdl.UpdateOptionGroup)
		menuGroup.DELETE("/option-groups/:id", productHdl.DeleteOptionGroup)
	}

	// 2.5 Multi-Outlet Management (Outlets, Zones, Stations)
	outletAdminGroup := api.Group("/admin", auth.AuthMiddleware(cfg.JWT.Secret), auth.RequireRoleOrPermission([]string{"admin"}, "menu.manage", "tables.manage", "users.manage"))
	{
		outletAdminGroup.GET("/outlets", outletHdl.GetAllOutlets)
		outletAdminGroup.GET("/outlets/:id", outletHdl.GetOutletByID)
		outletAdminGroup.POST("/outlets", outletHdl.CreateOutlet)
		outletAdminGroup.PUT("/outlets/:id", outletHdl.UpdateOutlet)
		outletAdminGroup.DELETE("/outlets/:id", outletHdl.DeleteOutlet)

		outletAdminGroup.GET("/zones", outletHdl.GetAllZones)
		outletAdminGroup.GET("/zones/:id", outletHdl.GetZoneByID)
		outletAdminGroup.POST("/zones", outletHdl.CreateZone)
		outletAdminGroup.PUT("/zones/:id", outletHdl.UpdateZone)
		outletAdminGroup.DELETE("/zones/:id", outletHdl.DeleteZone)

		outletAdminGroup.GET("/stations", outletHdl.GetAllStations)
		outletAdminGroup.GET("/stations/:id", outletHdl.GetStationByID)
		outletAdminGroup.POST("/stations", outletHdl.CreateStation)
		outletAdminGroup.PUT("/stations/:id", outletHdl.UpdateStation)
		outletAdminGroup.DELETE("/stations/:id", outletHdl.DeleteStation)
	}

	// 3. Tables Mutations
	tablesGroup := api.Group("/admin", auth.AuthMiddleware(cfg.JWT.Secret), auth.RequireRoleOrPermission([]string{"admin", "cashier"}, "tables.manage"))
	{
		tablesGroup.POST("/tables", tableHdl.CreateTable)
		tablesGroup.PUT("/tables/:id", tableHdl.UpdateTable)
		tablesGroup.DELETE("/tables/:id", tableHdl.DeleteTable)
		tablesGroup.PATCH("/tables/:id/status", tableHdl.UpdateTableStatus)
	}

	// 4. Inventory, Recipes, Purchases & Stock Logs
	inventoryGroup := api.Group("/admin", auth.AuthMiddleware(cfg.JWT.Secret), auth.RequireRoleOrPermission([]string{"admin"}, "stock.manage", "ingredients.manage", "po.manage", "stock.waste", "suppliers.manage"))
	{
		inventoryGroup.GET("/suppliers", inventoryHdl.ListSuppliers)
		inventoryGroup.GET("/suppliers/:id", inventoryHdl.GetSupplier)
		inventoryGroup.POST("/suppliers", inventoryHdl.CreateSupplier)
		inventoryGroup.PUT("/suppliers/:id", inventoryHdl.UpdateSupplier)
		inventoryGroup.DELETE("/suppliers/:id", inventoryHdl.DeleteSupplier)

		inventoryGroup.GET("/ingredients", inventoryHdl.ListIngredients)
		inventoryGroup.GET("/ingredients/:id", inventoryHdl.GetIngredient)
		inventoryGroup.POST("/ingredients", inventoryHdl.CreateIngredient)
		inventoryGroup.PUT("/ingredients/:id", inventoryHdl.UpdateIngredient)
		inventoryGroup.DELETE("/ingredients/:id", inventoryHdl.DeleteIngredient)

		inventoryGroup.GET("/recipes", inventoryHdl.ListRecipes)
		inventoryGroup.POST("/recipes", inventoryHdl.CreateRecipe)
		inventoryGroup.DELETE("/recipes/:id", inventoryHdl.DeleteRecipe)

		inventoryGroup.GET("/purchase-orders", inventoryHdl.ListPurchaseOrders)
		inventoryGroup.GET("/purchase-orders/:id", inventoryHdl.GetPurchaseOrder)
		inventoryGroup.POST("/purchase-orders", inventoryHdl.CreatePurchaseOrder)
		inventoryGroup.PATCH("/purchase-orders/:id/status", inventoryHdl.UpdatePurchaseOrderStatus)
		inventoryGroup.DELETE("/purchase-orders/:id", inventoryHdl.DeletePurchaseOrder)

		inventoryGroup.GET("/stock-logs/ingredients", inventoryHdl.ListIngredientStockLogs)
		inventoryGroup.GET("/stock-logs/products", inventoryHdl.ListProductStockLogs)
		inventoryGroup.GET("/stock-wastes", inventoryHdl.ListStockWastes)
		inventoryGroup.POST("/stock-wastes", inventoryHdl.CreateStockWaste)
	}

	// 5. System Settings & Logs
	systemAdminGroup := api.Group("/admin", auth.AuthMiddleware(cfg.JWT.Secret), auth.RequireRoleOrPermission([]string{"admin"}, "users.manage"))
	{
		systemAdminGroup.POST("/settings", systemHdl.SetSetting)
		systemAdminGroup.DELETE("/settings/:key", systemHdl.DeleteSetting)
		systemAdminGroup.GET("/logs/orders", systemHdl.ListLogs)
	}

	// 6. Reports
	reportsGroup := api.Group("/admin", auth.AuthMiddleware(cfg.JWT.Secret), auth.RequireRoleOrPermission([]string{"admin"}, "reports.sales_summary"))
	{
		reportsGroup.GET("/reports/sales", orderHdl.SalesSummaryReport)
	}

}
