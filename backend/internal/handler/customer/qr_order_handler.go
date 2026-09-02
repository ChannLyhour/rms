package customer

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/pos-system/backend/internal/domain"
	"github.com/pos-system/backend/internal/repository"
	"github.com/pos-system/backend/internal/service"
)

// QROrderHandler handles public customer QR-based ordering endpoints
type QROrderHandler struct {
	tableSvc    *service.TableService
	orderSvc    *service.OrderService
	productRepo *repository.ProductRepository
}

// NewQROrderHandler creates a new QROrderHandler
func NewQROrderHandler(tableSvc *service.TableService, orderSvc *service.OrderService, productRepo *repository.ProductRepository) *QROrderHandler {
	return &QROrderHandler{
		tableSvc:    tableSvc,
		orderSvc:    orderSvc,
		productRepo: productRepo,
	}
}

// GetMenu godoc — Returns available menu items for a given QR session token
// GET /api/v1/customer/menu/:token
func (h *QROrderHandler) GetMenu(c *gin.Context) {
	token := c.Param("token")

	_, err := h.tableSvc.GetSessionByToken(token)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	products, err := h.productRepo.ListProducts(uuid.Nil, true)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": products})
}

// PlaceOrder godoc — Places a new order for a given QR session token
// POST /api/v1/customer/orders/:token
func (h *QROrderHandler) PlaceOrder(c *gin.Context) {
	token := c.Param("token")

	session, err := h.tableSvc.GetSessionByToken(token)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	var req domain.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.TableSessionID = &session.ID
	req.OrderType = "qr_scan"

	order, err := h.orderSvc.CreateOrder(&req, nil)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, order)
}

// GetOrderStatus godoc — Returns live status of orders for a QR session
// GET /api/v1/customer/orders/:token/status
func (h *QROrderHandler) GetOrderStatus(c *gin.Context) {
	token := c.Param("token")

	session, err := h.tableSvc.GetSessionByToken(token)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	orders, err := h.orderSvc.GetOrdersBySession(session.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"session_id": session.ID,
		"table":      session.Table,
		"orders":     orders,
	})
}
