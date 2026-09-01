package order

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pos-system/backend/internal/products"
	"github.com/pos-system/backend/internal/system"
	"github.com/pos-system/backend/internal/table"
	"github.com/pos-system/backend/internal/ws"
	"github.com/pos-system/backend/pkg/pagination"
)

type Handler struct {
	svc         Service
	tableSvc    table.Service
	productRepo products.Repository
	systemRepo  system.Repository
	hub         *ws.Hub
}

func (h *Handler) SetHub(hub *ws.Hub) {
	h.hub = hub
}

func (h *Handler) broadcastWS(room, message string) {
	if h.hub != nil {
		h.hub.Broadcast <- ws.Message{
			RoomName: room,
			Data:     []byte(message),
		}
	}
}

func NewHandler(svc Service, tableSvc table.Service, productRepo products.Repository, systemRepo system.Repository) *Handler {
	return &Handler{
		svc:         svc,
		tableSvc:    tableSvc,
		productRepo: productRepo,
		systemRepo:  systemRepo,
	}
}

// ── POS Orders ───────────────────────────────────────────────────

func (h *Handler) CreatePOSOrder(c *gin.Context) {
	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var cashierID *uint64
	if uidVal, exists := c.Get("user_id"); exists {
		if uid, ok := uidVal.(uint64); ok {
			cashierID = &uid
		}
	}

	orderType := req.OrderType
	if orderType == "" {
		orderType = "dine_in"
	}

	order, err := h.svc.CreateOrder(&req, orderType, cashierID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.broadcastWS("kitchen", `{"event":"new_order"}`)
	h.broadcastWS("cashier", `{"event":"new_order"}`)
	if order.TableSession != nil && order.TableSession.SessionToken != "" {
		h.broadcastWS(fmt.Sprintf("table_%s", order.TableSession.SessionToken), `{"event":"order_updated"}`)
	} else if req.TableSessionID > 0 {
		if session, sErr := h.tableSvc.GetSessionByID(req.TableSessionID); sErr == nil && session != nil && session.SessionToken != "" {
			h.broadcastWS(fmt.Sprintf("table_%s", session.SessionToken), `{"event":"order_updated"}`)
		}
	}

	c.JSON(http.StatusCreated, gin.H{"data": order, "message": "order placed successfully"})
}

func (h *Handler) GetOrdersBySession(c *gin.Context) {
	sessionIDStr := c.Query("session_id")
	if sessionIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "session_id query parameter is required"})
		return
	}
	sessionID, err := strconv.ParseUint(sessionIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session_id"})
		return
	}

	orders, err := h.svc.GetOrdersBySession(sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": orders})
}

func (h *Handler) ListOrders(c *gin.Context) {
	p := pagination.GetPagination(c)
	status := c.Query("status")
	orderType := c.Query("order_type")

	var sessionID *uint64
	if sStr := c.Query("session_id"); sStr != "" {
		if sid, err := strconv.ParseUint(sStr, 10, 64); err == nil {
			sessionID = &sid
		}
	}

	orders, total, err := h.svc.ListOrders(status, orderType, sessionID, nil, nil, p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(orders, total, p))
}

func (h *Handler) GetOrderByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id"})
		return
	}
	order, err := h.svc.GetOrderByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": order})
}

func (h *Handler) UpdatePOSOrderStatus(c *gin.Context) {
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

	var acceptedBy *uint64
	var acceptedRole *string
	if uidVal, exists := c.Get("user_id"); exists {
		if uid, ok := uidVal.(uint64); ok && uid > 0 {
			acceptedBy = &uid
		}
	}
	if rVal, exists := c.Get("role"); exists {
		if rStr, ok := rVal.(string); ok && rStr != "" {
			acceptedRole = &rStr
		}
	}

	if err := h.svc.UpdateOrderStatusWithAccepter(id, req.Status, acceptedBy, acceptedRole); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.broadcastWS("kitchen", `{"event":"order_updated"}`)
	h.broadcastWS("cashier", `{"event":"order_updated"}`)
	
	order, err := h.svc.GetOrderByID(id)
	if err == nil && order.TableSession != nil {
		h.broadcastWS(fmt.Sprintf("table_%s", order.TableSession.SessionToken), `{"event":"order_updated"}`)
	}

	c.JSON(http.StatusOK, gin.H{"message": "order status updated", "data": order})
}

// ── Kitchen Orders ───────────────────────────────────────────────

func (h *Handler) ListKitchenOrders(c *gin.Context) {
	orders, err := h.svc.ListKitchenOrders()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": orders})
}

func (h *Handler) UpdateKitchenOrderStatus(c *gin.Context) {
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

	if err := h.svc.UpdateOrderStatus(id, req.Status); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.broadcastWS("cashier", `{"event":"order_updated"}`)
	h.broadcastWS("kitchen", `{"event":"order_updated"}`)
	
	order, err := h.svc.GetOrderByID(id)
	if err == nil && order.TableSession != nil {
		h.broadcastWS(fmt.Sprintf("table_%s", order.TableSession.SessionToken), `{"event":"order_updated"}`)
	}

	c.JSON(http.StatusOK, gin.H{"message": "order status updated"})
}

// ── Payments ─────────────────────────────────────────────────────

func (h *Handler) ProcessPayment(c *gin.Context) {
	var req ProcessPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var cashierID *uint64
	if uidVal, exists := c.Get("user_id"); exists {
		if uid, ok := uidVal.(uint64); ok {
			cashierID = &uid
		}
	}

	payment, err := h.svc.ProcessPayment(&req, cashierID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.broadcastWS("cashier", `{"event":"order_updated"}`)
	h.broadcastWS("kitchen", `{"event":"order_updated"}`)
	if req.TableSessionID > 0 {
		if session, sErr := h.tableSvc.GetSessionByID(req.TableSessionID); sErr == nil && session != nil && session.SessionToken != "" {
			h.broadcastWS(fmt.Sprintf("table_%s", session.SessionToken), `{"event":"order_updated"}`)
		}
	}

	c.JSON(http.StatusCreated, gin.H{"data": payment, "message": "payment processed successfully"})
}

func (h *Handler) ListPayments(c *gin.Context) {
	p := pagination.GetPagination(c)
	method := c.Query("method")
	status := c.Query("status")

	payments, total, err := h.svc.ListPayments(method, status, p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(payments, total, p))
}

func (h *Handler) GetPaymentByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payment id"})
		return
	}
	payment, err := h.svc.GetPaymentByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "payment not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": payment})
}

// ── Customer QR Endpoints ────────────────────────────────────────

func (h *Handler) GetCustomerMenu(c *gin.Context) {
	token := c.Param("token")
	session, err := h.tableSvc.GetSessionByToken(token)
	if err != nil || session == nil || session.Status != "active" {
		c.JSON(http.StatusNotFound, gin.H{"error": "This dining session has been closed or expired. Please ask staff to open a new session."})
		return
	}

	cats, _, err := h.productRepo.ListCategories("", nil, pagination.Params{Limit: 200, Offset: 0})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	isAvail := true
	prods, _, err := h.productRepo.ListProducts("", nil, nil, &isAvail, pagination.Params{Limit: 200, Offset: 0})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	taxRate := 7.0
	if h.systemRepo != nil {
		if s, err := h.systemRepo.GetSettingByKey("tax_rate"); err == nil && s != nil && s.SettingValue != nil {
			if parsed, err := strconv.ParseFloat(*s.SettingValue, 64); err == nil && parsed >= 0 {
				taxRate = parsed
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"session":    session,
		"categories": cats,
		"products":   prods,
		"tax_rate":   taxRate,
	})
}

func (h *Handler) PlaceCustomerOrder(c *gin.Context) {
	token := c.Param("token")
	session, err := h.tableSvc.GetSessionByToken(token)
	if err != nil || session == nil || session.Status != "active" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot place order: this dining session is closed. Please ask the cashier to open a new session."})
		return
	}

	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	req.TableSessionID = session.ID

	order, err := h.svc.CreateOrder(&req, "qr_scan", nil)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.broadcastWS("kitchen", `{"event":"new_order"}`)
	h.broadcastWS("cashier", `{"event":"new_order"}`)

	c.JSON(http.StatusCreated, gin.H{"data": order, "message": "order placed successfully"})
}

func (h *Handler) GetCustomerOrderStatus(c *gin.Context) {
	token := c.Param("token")
	session, err := h.tableSvc.GetSessionByToken(token)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "invalid session token"})
		return
	}

	orders, err := h.svc.GetOrdersBySession(session.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"session": session,
		"orders":  orders,
	})
}

// ── Reports ──────────────────────────────────────────────────────

func (h *Handler) SalesSummaryReport(c *gin.Context) {
	fromStr := c.DefaultQuery("from", time.Now().Format("2006-01-02"))
	toStr := c.DefaultQuery("to", time.Now().Format("2006-01-02"))

	from, err := time.Parse("2006-01-02", fromStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid 'from' date format (YYYY-MM-DD)"})
		return
	}
	to, err := time.Parse("2006-01-02", toStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid 'to' date format (YYYY-MM-DD)"})
		return
	}
	to = to.Add(23*time.Hour + 59*time.Minute + 59*time.Second)

	report, err := h.svc.GetSalesSummary(from, to)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": report})
}

type CallCashierRequest struct {
	TableNumber string `json:"table_number"`
	ServiceType string `json:"service_type"` // water | cutlery | waiter | clean | bill
	Title       string `json:"title"`
	Message     string `json:"message"`
}

func (h *Handler) CallCashier(c *gin.Context) {
	token := c.Param("token")
	session, err := h.tableSvc.GetSessionByToken(token)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "invalid session token"})
		return
	}

	var req CallCashierRequest
	_ = c.ShouldBindJSON(&req)

	tableNum := ""
	if session.Table != nil {
		tableNum = session.Table.TableNumber
	}
	if req.TableNumber != "" {
		tableNum = req.TableNumber
	}

	title := req.Title
	if title == "" {
		if req.ServiceType == "bill" {
			title = "Ready for the Bill / Checkout"
		} else if req.ServiceType == "water" {
			title = "Request Extra Water / Ice"
		} else if req.ServiceType == "cutlery" {
			title = "Need Extra Cutlery & Napkins"
		} else if req.ServiceType == "clean" {
			title = "Request Table Cleaning"
		} else {
			title = "Call Waiter to Table"
		}
	}

	// Update table status in database
	newStatus := "calling_waiter"
	if req.ServiceType == "bill" {
		newStatus = "bill_requested"
	}
	if session.TableID > 0 {
		_ = h.tableSvc.UpdateTableStatus(session.TableID, newStatus)
	}

	msg := fmt.Sprintf(`{"event":"call_cashier","table_number":"%s","table_id":%d,"service_type":"%s","title":"%s","time":"%s"}`,
		tableNum, session.TableID, req.ServiceType, title, time.Now().Format("15:04:05"))

	h.broadcastWS("cashier", msg)
	h.broadcastWS("kitchen", msg)
	h.broadcastWS(fmt.Sprintf("table_%s", token), msg)
	h.broadcastWS("cashier", `{"event":"order_updated"}`)

	c.JSON(http.StatusOK, gin.H{
		"message":      "cashier notified",
		"table_number": tableNum,
		"title":        title,
		"service_type": req.ServiceType,
		"time":         time.Now().Format("15:04:05"),
	})
}

func (h *Handler) PayCustomerTicket(c *gin.Context) {
	token := c.Param("token")
	session, err := h.tableSvc.GetSessionByToken(token)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "invalid session token"})
		return
	}

	var req PayCustomerTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, err := h.svc.GetOrderByID(req.OrderID)
	if err != nil || order == nil || order.TableSessionID != session.ID {
		c.JSON(http.StatusNotFound, gin.H{"error": "order ticket not found for this table"})
		return
	}

	var methodPtr *string
	if req.PaymentMethod != "" {
		methodPtr = &req.PaymentMethod
	}

	if err := h.svc.UpdateOrderPaymentInfo(req.OrderID, "paid", methodPtr); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update ticket payment status"})
		return
	}

	// Real-time broadcasts to Table, Cashier, and Kitchen
	h.broadcastWS(fmt.Sprintf("table_%s", token), fmt.Sprintf(`{"event":"order_updated","order_id":%d,"payment_status":"paid"}`, req.OrderID))
	h.broadcastWS("cashier", fmt.Sprintf(`{"event":"order_updated","order_id":%d,"payment_status":"paid"}`, req.OrderID))
	h.broadcastWS("kitchen", fmt.Sprintf(`{"event":"order_updated","order_id":%d,"payment_status":"paid"}`, req.OrderID))

	c.JSON(http.StatusOK, gin.H{
		"message":        "ticket payment registered successfully",
		"order_id":       req.OrderID,
		"payment_status": "paid",
	})
}
