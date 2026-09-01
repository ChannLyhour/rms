package outlet

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pos-system/backend/internal/domain"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// RegisterRoutes registers the outlet, zone, and station routes
func (h *Handler) RegisterRoutes(r *gin.RouterGroup) {
	// ── Outlets ──
	outlets := r.Group("/outlets")
	{
		outlets.GET("", h.GetAllOutlets)
		outlets.GET("/:id", h.GetOutletByID)
		outlets.POST("", h.CreateOutlet)
		outlets.PUT("/:id", h.UpdateOutlet)
		outlets.DELETE("/:id", h.DeleteOutlet)

		// Nested Zones
		outlets.GET("/:id/zones", h.GetZonesByOutlet)
		outlets.POST("/:id/zones", h.CreateZoneForOutlet)

		// Nested Stations
		outlets.GET("/:id/stations", h.GetStationsByOutlet)
		outlets.POST("/:id/stations", h.CreateStationForOutlet)
	}

	// ── Zones ──
	zones := r.Group("/zones")
	{
		zones.GET("", h.GetAllZones)
		zones.GET("/:id", h.GetZoneByID)
		zones.POST("", h.CreateZone)
		zones.PUT("/:id", h.UpdateZone)
		zones.DELETE("/:id", h.DeleteZone)
	}

	// ── Stations ──
	stations := r.Group("/stations")
	{
		stations.GET("", h.GetAllStations)
		stations.GET("/:id", h.GetStationByID)
		stations.POST("", h.CreateStation)
		stations.PUT("/:id", h.UpdateStation)
		stations.DELETE("/:id", h.DeleteStation)
	}
}

// ── Outlets Handlers ───────────────────────────────────────────────

func (h *Handler) GetAllOutlets(c *gin.Context) {
	onlyActive := c.DefaultQuery("active", "false") == "true"
	search := c.Query("search")

	outlets, err := h.service.GetAllOutlets(c.Request.Context(), search, onlyActive)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": outlets})
}

func (h *Handler) GetOutletByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid outlet ID"})
		return
	}

	outlet, err := h.service.GetOutletByID(c.Request.Context(), id)
	if err != nil {
		if err == ErrOutletNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Outlet not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": outlet})
}

func (h *Handler) CreateOutlet(c *gin.Context) {
	var req domain.CreateOutletRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	outlet, err := h.service.CreateOutlet(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": outlet, "message": "Outlet created successfully"})
}

func (h *Handler) UpdateOutlet(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid outlet ID"})
		return
	}

	var req domain.UpdateOutletRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	outlet, err := h.service.UpdateOutlet(c.Request.Context(), id, &req)
	if err != nil {
		if err == ErrOutletNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Outlet not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": outlet, "message": "Outlet updated successfully"})
}

func (h *Handler) DeleteOutlet(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid outlet ID"})
		return
	}

	if err := h.service.DeleteOutlet(c.Request.Context(), id); err != nil {
		if err == ErrOutletNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Outlet not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Outlet deleted successfully"})
}

// ── Zones Handlers ─────────────────────────────────────────────────

func (h *Handler) GetAllZones(c *gin.Context) {
	var outletIDPtr *uint64
	if outletIDStr := c.Query("outlet_id"); outletIDStr != "" {
		if id, err := strconv.ParseUint(outletIDStr, 10, 64); err == nil {
			outletIDPtr = &id
		}
	}
	search := c.Query("search")

	zones, err := h.service.GetAllZones(c.Request.Context(), outletIDPtr, search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": zones})
}

func (h *Handler) GetZonesByOutlet(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid outlet ID"})
		return
	}

	zones, err := h.service.GetZonesByOutlet(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": zones})
}

func (h *Handler) GetZoneByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid zone ID"})
		return
	}

	zone, err := h.service.GetZoneByID(c.Request.Context(), id)
	if err != nil {
		if err == ErrZoneNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Zone not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": zone})
}

func (h *Handler) CreateZoneForOutlet(c *gin.Context) {
	outletID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid outlet ID"})
		return
	}

	var req domain.CreateZoneRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	req.OutletID = outletID

	zone, err := h.service.CreateZone(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": zone, "message": "Zone created successfully"})
}

func (h *Handler) CreateZone(c *gin.Context) {
	var req domain.CreateZoneRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.OutletID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "outlet_id is required"})
		return
	}

	zone, err := h.service.CreateZone(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": zone, "message": "Zone created successfully"})
}

func (h *Handler) UpdateZone(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid zone ID"})
		return
	}

	var req domain.UpdateZoneRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	zone, err := h.service.UpdateZone(c.Request.Context(), id, &req)
	if err != nil {
		if err == ErrZoneNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Zone not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": zone, "message": "Zone updated successfully"})
}

func (h *Handler) DeleteZone(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid zone ID"})
		return
	}

	if err := h.service.DeleteZone(c.Request.Context(), id); err != nil {
		if err == ErrZoneNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Zone not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Zone deleted successfully"})
}

// ── Stations Handlers ──────────────────────────────────────────────

func (h *Handler) GetAllStations(c *gin.Context) {
	var outletIDPtr *uint64
	if outletIDStr := c.Query("outlet_id"); outletIDStr != "" {
		if id, err := strconv.ParseUint(outletIDStr, 10, 64); err == nil {
			outletIDPtr = &id
		}
	}
	search := c.Query("search")

	stations, err := h.service.GetAllStations(c.Request.Context(), outletIDPtr, search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": stations})
}

func (h *Handler) GetStationsByOutlet(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid outlet ID"})
		return
	}

	stations, err := h.service.GetStationsByOutlet(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": stations})
}

func (h *Handler) GetStationByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid station ID"})
		return
	}

	station, err := h.service.GetStationByID(c.Request.Context(), id)
	if err != nil {
		if err == ErrStationNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Station not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": station})
}

func (h *Handler) CreateStationForOutlet(c *gin.Context) {
	outletID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid outlet ID"})
		return
	}

	var req domain.CreateStationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	req.OutletID = outletID

	station, err := h.service.CreateStation(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": station, "message": "Station created successfully"})
}

func (h *Handler) CreateStation(c *gin.Context) {
	var req domain.CreateStationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.OutletID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "outlet_id is required"})
		return
	}

	station, err := h.service.CreateStation(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": station, "message": "Station created successfully"})
}

func (h *Handler) UpdateStation(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid station ID"})
		return
	}

	var req domain.UpdateStationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	station, err := h.service.UpdateStation(c.Request.Context(), id, &req)
	if err != nil {
		if err == ErrStationNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Station not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": station, "message": "Station updated successfully"})
}

func (h *Handler) DeleteStation(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid station ID"})
		return
	}

	if err := h.service.DeleteStation(c.Request.Context(), id); err != nil {
		if err == ErrStationNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Station not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Station deleted successfully"})
}
