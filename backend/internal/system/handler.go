package system

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

// ── Settings ─────────────────────────────────────────────────────

func (h *Handler) ListSettings(c *gin.Context) {
	p := pagination.GetPagination(c)
	list, total, err := h.svc.ListSettings(p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(list, total, p))
}

func (h *Handler) GetSetting(c *gin.Context) {
	key := c.Param("key")
	s, err := h.svc.GetSetting(key)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "setting not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": s})
}

func (h *Handler) SetSetting(c *gin.Context) {
	var req struct {
		Key   string `json:"key" binding:"required"`
		Value string `json:"value" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var userID *uint64
	if uidVal, exists := c.Get("user_id"); exists {
		if uid, ok := uidVal.(uint64); ok {
			userID = &uid
		}
	}

	if err := h.svc.SetSetting(req.Key, req.Value, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "setting updated"})
}

func (h *Handler) DeleteSetting(c *gin.Context) {
	key := c.Param("key")
	if err := h.svc.DeleteSetting(key); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "setting deleted"})
}

// ── Status Logs ──────────────────────────────────────────────────

func (h *Handler) ListLogs(c *gin.Context) {
	p := pagination.GetPagination(c)
	var orderID *uint64
	if oStr := c.Query("order_id"); oStr != "" {
		if oid, err := strconv.ParseUint(oStr, 10, 64); err == nil {
			orderID = &oid
		}
	}

	logs, total, err := h.svc.ListLogs(orderID, p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(logs, total, p))
}
