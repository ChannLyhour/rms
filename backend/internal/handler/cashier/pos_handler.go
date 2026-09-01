package cashier

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pos-system/backend/internal/domain"
	"github.com/pos-system/backend/internal/middleware"
	"github.com/pos-system/backend/internal/service"
)

// POSHandler handles cashier POS endpoints
type POSHandler struct {
	orderSvc *service.OrderService
}

// NewPOSHandler creates a new POSHandler
func NewPOSHandler(svc *service.OrderService) *POSHandler {
	return &POSHandler{orderSvc: svc}
}

// CreateOrder godoc
// POST /api/v1/cashier/orders
func (h *POSHandler) CreateOrder(c *gin.Context) {
	var req domain.CreateOrderRequest
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

	if req.OrderType == "" {
		req.OrderType = "dine_in"
	}
	order, err := h.orderSvc.CreateOrder(&req, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, order)
}

// GetOrdersBySession godoc
// GET /api/v1/cashier/orders?session_id=:id
func (h *POSHandler) GetOrdersBySession(c *gin.Context) {
	sessionIDStr := c.Query("session_id")
	sessionID, err := strconv.ParseUint(sessionIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session_id"})
		return
	}

	orders, err := h.orderSvc.GetOrdersBySession(sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": orders})
}

// UpdateOrderStatus godoc
// PATCH /api/v1/cashier/orders/:id/status
func (h *POSHandler) UpdateOrderStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id"})
		return
	}

	var req domain.UpdateOrderStatusRequest
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

	c.JSON(http.StatusOK, gin.H{"message": "order status updated"})
}

// ProcessPayment godoc
// POST /api/v1/cashier/payments
func (h *POSHandler) ProcessPayment(c *gin.Context) {
	var req domain.ProcessPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	claims := middleware.GetClaims(c)
	cashierID := uint64(0)
	if claims != nil {
		cashierID = claims.UserID
	}

	payment, err := h.orderSvc.ProcessPayment(&req, cashierID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, payment)
}
