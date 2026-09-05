package inventory

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/pos-system/backend/pkg/pagination"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

// ── Suppliers Endpoints ──────────────────────────────────────────

func (h *Handler) ListSuppliers(c *gin.Context) {
	p := pagination.GetPagination(c)
	search := c.Query("search")

	list, total, err := h.svc.ListSuppliers(search, p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(list, total, p))
}

func (h *Handler) GetSupplier(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid supplier id"})
		return
	}
	item, err := h.svc.GetSupplier(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "supplier not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": item})
}

func (h *Handler) CreateSupplier(c *gin.Context) {
	var req Supplier
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.CreateSupplier(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": req, "message": "supplier created"})
}

func (h *Handler) UpdateSupplier(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid supplier id"})
		return
	}
	var req Supplier
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.UpdateSupplier(id, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "supplier updated"})
}

func (h *Handler) DeleteSupplier(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid supplier id"})
		return
	}
	if err := h.svc.DeleteSupplier(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "supplier deleted"})
}

// ── Ingredient Categories Endpoints ──────────────────────────────

func (h *Handler) ListIngredientCategories(c *gin.Context) {
	search := c.Query("search")

	list, err := h.svc.ListIngredientCategories(search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

func (h *Handler) GetIngredientCategory(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ingredient category id"})
		return
	}
	item, err := h.svc.GetIngredientCategory(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ingredient category not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": item})
}

type ingredientCategoryReq struct {
	IngredientCategory
	ImageURL *string `json:"image_url"`
}

func (h *Handler) CreateIngredientCategory(c *gin.Context) {
	var req ingredientCategoryReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Image == nil && req.ImageURL != nil {
		req.Image = req.ImageURL
	}
	cat := req.IngredientCategory
	if err := h.svc.CreateIngredientCategory(&cat); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": cat, "message": "ingredient category created"})
}

func (h *Handler) UpdateIngredientCategory(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ingredient category id"})
		return
	}
	var req ingredientCategoryReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Image == nil && req.ImageURL != nil {
		req.Image = req.ImageURL
	}
	cat := req.IngredientCategory
	if err := h.svc.UpdateIngredientCategory(id, &cat); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "ingredient category updated"})
}

func (h *Handler) DeleteIngredientCategory(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ingredient category id"})
		return
	}
	if err := h.svc.DeleteIngredientCategory(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "ingredient category deleted"})
}

// ── Ingredients Endpoints ────────────────────────────────────────

func (h *Handler) ListIngredients(c *gin.Context) {
	p := pagination.GetPagination(c)
	search := c.Query("search")
	lowStock := c.Query("low_stock") == "true"

	var categoryID *uuid.UUID
	if catStr := c.Query("category_id"); catStr != "" {
		if catUUID, err := uuid.Parse(catStr); err == nil {
			categoryID = &catUUID
		}
	}

	var outletID *uuid.UUID
	if outStr := c.Query("outlet_id"); outStr != "" {
		if outUUID, err := uuid.Parse(outStr); err == nil {
			outletID = &outUUID
		}
	}

	list, total, err := h.svc.ListIngredients(search, lowStock, categoryID, outletID, p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(list, total, p))
}

func (h *Handler) GetIngredient(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ingredient id"})
		return
	}
	item, err := h.svc.GetIngredient(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ingredient not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": item})
}

func (h *Handler) CreateIngredient(c *gin.Context) {
	var req Ingredient
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.CreateIngredient(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": req, "message": "ingredient created"})
}

func (h *Handler) UpdateIngredient(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ingredient id"})
		return
	}
	var req Ingredient
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.UpdateIngredient(id, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "ingredient updated"})
}

func (h *Handler) DeleteIngredient(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ingredient id"})
		return
	}
	if err := h.svc.DeleteIngredient(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "ingredient deleted"})
}

// ── Recipes Endpoints ────────────────────────────────────────────

func (h *Handler) ListRecipes(c *gin.Context) {
	p := pagination.GetPagination(c)
	var productID *uuid.UUID
	if pidStr := c.Query("product_id"); pidStr != "" && pidStr != "all" {
		if pid, err := uuid.Parse(pidStr); err == nil {
			productID = &pid
		}
	}

	list, total, err := h.svc.ListRecipes(productID, p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(list, total, p))
}

func (h *Handler) CreateRecipe(c *gin.Context) {
	var req Recipe
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.CreateRecipe(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": req, "message": "recipe created"})
}

func (h *Handler) DeleteRecipe(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid recipe id"})
		return
	}
	if err := h.svc.DeleteRecipe(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "recipe deleted"})
}

// ── Purchase Orders Endpoints ────────────────────────────────────

func (h *Handler) ListPurchaseOrders(c *gin.Context) {
	p := pagination.GetPagination(c)
	status := c.Query("status")
	var supplierID *uuid.UUID
	if sidStr := c.Query("supplier_id"); sidStr != "" && sidStr != "all" {
		if sid, err := uuid.Parse(sidStr); err == nil {
			supplierID = &sid
		}
	}

	list, total, err := h.svc.ListPurchaseOrders(supplierID, status, p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(list, total, p))
}

func (h *Handler) GetPurchaseOrder(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid purchase order id"})
		return
	}
	item, err := h.svc.GetPurchaseOrder(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "purchase order not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": item})
}

func (h *Handler) CreatePurchaseOrder(c *gin.Context) {
	var req PurchaseOrder
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.CreatePurchaseOrder(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": req, "message": "purchase order created"})
}

func (h *Handler) UpdatePurchaseOrderStatus(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid purchase order id"})
		return
	}
	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.UpdatePurchaseOrderStatus(id, req.Status); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "purchase order status updated"})
}

func (h *Handler) DeletePurchaseOrder(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid purchase order id"})
		return
	}
	if err := h.svc.DeletePurchaseOrder(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "purchase order deleted"})
}

// ── Stock Logs Endpoints ─────────────────────────────────────────

func (h *Handler) ListIngredientStockLogs(c *gin.Context) {
	p := pagination.GetPagination(c)
	var ingID *uuid.UUID
	if idStr := c.Query("ingredient_id"); idStr != "" && idStr != "all" {
		if id, err := uuid.Parse(idStr); err == nil {
			ingID = &id
		}
	}

	list, total, err := h.svc.ListIngredientStockLogs(ingID, p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(list, total, p))
}

func (h *Handler) ListProductStockLogs(c *gin.Context) {
	p := pagination.GetPagination(c)
	var pID *uuid.UUID
	if idStr := c.Query("product_id"); idStr != "" && idStr != "all" {
		if id, err := uuid.Parse(idStr); err == nil {
			pID = &id
		}
	}

	list, total, err := h.svc.ListProductStockLogs(pID, p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(list, total, p))
}

func (h *Handler) ListStockWastes(c *gin.Context) {
	p := pagination.GetPagination(c)
	list, total, err := h.svc.ListStockWastes(p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(list, total, p))
}

func (h *Handler) CreateStockWaste(c *gin.Context) {
	var req StockWaste
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.CreateStockWaste(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": req, "message": "stock waste recorded"})
}
