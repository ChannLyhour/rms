package table

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pos-system/backend/internal/ws"
	"github.com/pos-system/backend/pkg/pagination"
)

type Handler struct {
	svc Service
	hub *ws.Hub
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

func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// ── Table Endpoints ──────────────────────────────────────────────

func (h *Handler) ListTables(c *gin.Context) {
	p := pagination.GetPagination(c)
	zone := c.Query("zone")
	status := c.Query("status")

	tables, total, err := h.svc.ListTables(zone, status, p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(tables, total, p))
}

func (h *Handler) GetTable(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid table id"})
		return
	}
	t, err := h.svc.GetTable(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "table not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": t})
}

func (h *Handler) CreateTable(c *gin.Context) {
	var req Table
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.CreateTable(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": req, "message": "table created"})
}

func (h *Handler) UpdateTable(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid table id"})
		return
	}
	var req Table
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.UpdateTable(id, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "table updated"})
}

func (h *Handler) DeleteTable(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid table id"})
		return
	}
	if err := h.svc.DeleteTable(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "table deleted"})
}

func (h *Handler) UpdateTableStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid table id"})
		return
	}
	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.UpdateTableStatus(id, req.Status); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "table status updated"})
}

// ── Session Endpoints ────────────────────────────────────────────

func (h *Handler) OpenSession(c *gin.Context) {
	var req struct {
		TableID      uint64  `json:"table_id" binding:"required"`
		CustomerName *string `json:"customer_name"`
		GuestCount   int     `json:"guest_count"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var waiterID *uint64
	if uidVal, exists := c.Get("user_id"); exists {
		if uid, ok := uidVal.(uint64); ok {
			waiterID = &uid
		}
	}

	session, qrBase64, err := h.svc.OpenSession(req.TableID, req.CustomerName, req.GuestCount, waiterID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"session": session,
		"qr_code": qrBase64,
	})
}

func (h *Handler) ListSessions(c *gin.Context) {
	p := pagination.GetPagination(c)
	status := c.Query("status")
	var tableID *uint64
	if tStr := c.Query("table_id"); tStr != "" {
		if tid, err := strconv.ParseUint(tStr, 10, 64); err == nil {
			tableID = &tid
		}
	}

	sessions, total, err := h.svc.ListSessions(tableID, status, p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(sessions, total, p))
}

func (h *Handler) ListActiveSessions(c *gin.Context) {
	sessions, err := h.svc.ListActiveSessions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": sessions})
}

func (h *Handler) CloseSession(c *gin.Context) {
	sessionID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session id"})
		return
	}

	var tableID uint64
	if tStr := c.Query("table_id"); tStr != "" {
		tableID, _ = strconv.ParseUint(tStr, 10, 64)
	}

	session, _ := h.svc.GetSessionByID(sessionID)

	if err := h.svc.CloseSession(sessionID, tableID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	h.broadcastWS("cashier", `{"event":"order_updated"}`)
	h.broadcastWS("kitchen", `{"event":"order_updated"}`)
	h.broadcastWS("cashier", `{"event":"session_closed"}`)

	if session != nil {
		if session.SessionToken != "" {
			h.broadcastWS(fmt.Sprintf("table_%s", session.SessionToken), `{"event":"session_closed"}`)
			h.broadcastWS(fmt.Sprintf("table_%s", session.SessionToken), `{"event":"order_updated"}`)
		}
		if session.TableID > 0 {
			h.broadcastWS(fmt.Sprintf("table_%d", session.TableID), `{"event":"session_closed"}`)
		}
	}
	if tableID > 0 {
		h.broadcastWS(fmt.Sprintf("table_%d", tableID), `{"event":"session_closed"}`)
	}

	c.JSON(http.StatusOK, gin.H{"message": "session closed"})
}
