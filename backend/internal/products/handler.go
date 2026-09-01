package products

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pos-system/backend/pkg/pagination"
)

type Handler struct {
	svc Service
}

func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// ── Categories ───────────────────────────────────────────────────

func (h *Handler) ListCategories(c *gin.Context) {
	p := pagination.GetPagination(c)
	search := c.Query("search")

	cats, total, err := h.svc.ListCategories(search, p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(cats, total, p))
}

func (h *Handler) GetCategory(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category id"})
		return
	}
	cat, err := h.svc.GetCategory(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "category not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": cat})
}

func (h *Handler) CreateCategory(c *gin.Context) {
	var req CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var creatorID *uint64
	if uidVal, exists := c.Get("user_id"); exists {
		if uid, ok := uidVal.(uint64); ok {
			creatorID = &uid
		}
	}

	cat, err := h.svc.CreateCategory(&req, creatorID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": cat, "message": "category created"})
}

func (h *Handler) UpdateCategory(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category id"})
		return
	}
	var req Category
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.UpdateCategory(id, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "category updated"})
}

func (h *Handler) DeleteCategory(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category id"})
		return
	}
	if err := h.svc.DeleteCategory(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "category deleted"})
}

// ── Products ─────────────────────────────────────────────────────

func (h *Handler) ListProducts(c *gin.Context) {
	p := pagination.GetPagination(c)
	search := c.Query("search")
	var categoryID *uint64
	if catStr := c.Query("category_id"); catStr != "" {
		if catID, err := strconv.ParseUint(catStr, 10, 64); err == nil {
			categoryID = &catID
		}
	}

	var isAvailable *bool
	if availStr := c.Query("is_available"); availStr != "" {
		avail := availStr == "true"
		isAvailable = &avail
	}

	prods, total, err := h.svc.ListProducts(search, categoryID, isAvailable, p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(prods, total, p))
}

func (h *Handler) GetProduct(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}
	prod, err := h.svc.GetProduct(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": prod})
}

func (h *Handler) CreateProduct(c *gin.Context) {
	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var creatorID *uint64
	if uidVal, exists := c.Get("user_id"); exists {
		if uid, ok := uidVal.(uint64); ok {
			creatorID = &uid
		}
	}

	prod, err := h.svc.CreateProduct(&req, creatorID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": prod, "message": "product created"})
}

func (h *Handler) UpdateProduct(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	var req UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	prod, err := h.svc.UpdateProduct(id, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": prod, "message": "product updated"})
}

func (h *Handler) DeleteProduct(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}
	if err := h.svc.DeleteProduct(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "product deleted"})
}

// ── Option Groups ────────────────────────────────────────────────

func (h *Handler) ListOptionGroups(c *gin.Context) {
	p := pagination.GetPagination(c)
	search := c.Query("search")

	groups, total, err := h.svc.ListOptionGroups(search, p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(groups, total, p))
}

func (h *Handler) GetOptionGroup(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid option group id"})
		return
	}
	g, err := h.svc.GetOptionGroup(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "option group not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": g})
}

func (h *Handler) CreateOptionGroup(c *gin.Context) {
	var req CreateOptionGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var creatorID *uint64
	if uidVal, exists := c.Get("user_id"); exists {
		if uid, ok := uidVal.(uint64); ok {
			creatorID = &uid
		}
	}

	g, err := h.svc.CreateOptionGroup(&req, creatorID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": g, "message": "option group created"})
}

func (h *Handler) UpdateOptionGroup(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid option group id"})
		return
	}
	var req OptionGroup
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.UpdateOptionGroup(id, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "option group updated"})
}

func (h *Handler) DeleteOptionGroup(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid option group id"})
		return
	}
	if err := h.svc.DeleteOptionGroup(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "option group deleted"})
}
