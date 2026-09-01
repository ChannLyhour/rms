package cashier

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pos-system/backend/internal/middleware"
	"github.com/pos-system/backend/internal/service"
)

// TableSessionHandler handles cashier table & QR session endpoints
type TableSessionHandler struct {
	tableSvc *service.TableService
}

// NewTableSessionHandler creates a new TableSessionHandler
func NewTableSessionHandler(svc *service.TableService) *TableSessionHandler {
	return &TableSessionHandler{tableSvc: svc}
}

// ListTables godoc
// GET /api/v1/cashier/tables
func (h *TableSessionHandler) ListTables(c *gin.Context) {
	tables, err := h.tableSvc.ListTables()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": tables})
}

// OpenSession godoc
// POST /api/v1/cashier/sessions
func (h *TableSessionHandler) OpenSession(c *gin.Context) {
	var req struct {
		TableID uint64 `json:"table_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	claims := middleware.GetClaims(c)
	userID := uint64(0)
	if claims != nil {
		userID = claims.UserID
	}

	session, qrData, err := h.tableSvc.OpenSession(req.TableID, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"session": session,
		"qr_code": qrData,
	})
}

// ListActiveSessions godoc
// GET /api/v1/cashier/sessions
func (h *TableSessionHandler) ListActiveSessions(c *gin.Context) {
	sessions, err := h.tableSvc.ListActiveSessions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": sessions})
}

// CloseSession godoc
// DELETE /api/v1/cashier/sessions/:id
func (h *TableSessionHandler) CloseSession(c *gin.Context) {
	sessionID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session id"})
		return
	}

	tableID, err := strconv.ParseUint(c.Query("table_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "table_id query param required"})
		return
	}

	if err := h.tableSvc.CloseSession(sessionID, tableID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "session closed"})
}
