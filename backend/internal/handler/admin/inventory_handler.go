package admin

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/pos-system/backend/internal/domain"
	"github.com/pos-system/backend/internal/repository"
)

// InventoryHandler handles admin inventory endpoints (products & categories)
type InventoryHandler struct {
	productRepo *repository.ProductRepository
}

// NewInventoryHandler creates a new InventoryHandler
func NewInventoryHandler(repo *repository.ProductRepository) *InventoryHandler {
	return &InventoryHandler{productRepo: repo}
}

// --- Categories ---

// ListCategories godoc
// GET /api/v1/admin/categories
func (h *InventoryHandler) ListCategories(c *gin.Context) {
	cats, err := h.productRepo.ListCategories()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": cats})
}

// CreateCategory godoc
// POST /api/v1/admin/categories
func (h *InventoryHandler) CreateCategory(c *gin.Context) {
	var cat domain.Category
	if err := c.ShouldBindJSON(&cat); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.productRepo.CreateCategory(&cat); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, cat)
}

// --- Products ---

// ListProducts godoc
// GET /api/v1/admin/products
func (h *InventoryHandler) ListProducts(c *gin.Context) {
	catIDStr := c.Query("category_id")
	var catID uuid.UUID
	if catIDStr != "" && catIDStr != "all" {
		catID, _ = uuid.Parse(catIDStr)
	}
	products, err := h.productRepo.ListProducts(catID, false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": products})
}

// CreateProduct godoc
// POST /api/v1/admin/products
func (h *InventoryHandler) CreateProduct(c *gin.Context) {
	var req domain.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	isAvail := true
	if req.IsAvailable != nil {
		isAvail = *req.IsAvailable
	}

	product := &domain.Product{
		CategoryID:        req.CategoryID,
		Name:              req.Name,
		Description:       req.Description,
		Price:             req.Price,
		StockQuantity:     req.StockQuantity,
		LowStockThreshold: req.LowStockThreshold,
		TrackStock:        req.TrackStock,
		ImageURL:          req.ImageURL,
		IsAvailable:       isAvail,
	}

	if err := h.productRepo.CreateProduct(product); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(req.OptionGroupIDs) > 0 {
		_ = h.productRepo.AssignOptionGroupsToProduct(product.ID, req.OptionGroupIDs)
	}

	c.JSON(http.StatusCreated, product)
}

// UpdateProduct godoc
// PUT /api/v1/admin/products/:id
func (h *InventoryHandler) UpdateProduct(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	product, err := h.productRepo.FindProductByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}

	if err := c.ShouldBindJSON(product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.productRepo.UpdateProduct(product); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, product)
}

// DeleteProduct godoc
// DELETE /api/v1/admin/products/:id
func (h *InventoryHandler) DeleteProduct(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	if err := h.productRepo.DeleteProduct(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "product deleted"})
}

// --- Option Groups ---

// ListOptionGroups godoc
// GET /api/v1/admin/option-groups
func (h *InventoryHandler) ListOptionGroups(c *gin.Context) {
	groups, err := h.productRepo.ListOptionGroups()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": groups})
}

// CreateOptionGroup godoc
// POST /api/v1/admin/option-groups
func (h *InventoryHandler) CreateOptionGroup(c *gin.Context) {
	var group domain.OptionGroup
	if err := c.ShouldBindJSON(&group); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.productRepo.CreateOptionGroup(&group); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, group)
}
