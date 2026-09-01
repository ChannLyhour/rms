package kitchen

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pos-system/backend/internal/middleware"
	"github.com/pos-system/backend/internal/service"
)

// KDSHandler handles Kitchen Display System endpoints
type KDSHandler struct {
	orderSvc *service.OrderService
}

// NewKDSHandler creates a new KDSHandler
func NewKDSHandler(svc *service.OrderService) *KDSHandler {
	return &KDSHandler{orderSvc: svc}
}

// ListKitchenOrders godoc
// GET /api/v1/kitchen/orders
func (h *KDSHandler) ListKitchenOrders(c *gin.Context) {
	orders, err := h.orderSvc.ListKitchenOrders()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": orders})
}

// UpdateOrderStatus godoc
// PATCH /api/v1/kitchen/orders/:id/status
func (h *KDSHandler) UpdateOrderStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	claims := middleware.GetClaims(c)
	var userID *uint64
	if claims != nil {
		uid := claims.UserID
		userID = &uid
	}

	if err := h.orderSvc.UpdateStatus(id, req.Status, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "order updated"})
}
