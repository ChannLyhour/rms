package admin

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pos-system/backend/internal/service"
)

// ReportHandler handles admin reporting endpoints
type ReportHandler struct {
	orderSvc *service.OrderService
}

// NewReportHandler creates a new ReportHandler
func NewReportHandler(svc *service.OrderService) *ReportHandler {
	return &ReportHandler{orderSvc: svc}
}

// SalesSummary godoc
// GET /api/v1/admin/reports/sales?from=2024-01-01&to=2024-12-31
func (h *ReportHandler) SalesSummary(c *gin.Context) {
	from := c.Query("from")
	to := c.Query("to")

	if from == "" || to == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "from and to query params are required (YYYY-MM-DD)"})
		return
	}

	total, count, err := h.orderSvc.GetSummary(from, to)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"from":         from,
		"to":           to,
		"total_revenue": total,
		"order_count":  count,
	})
}
