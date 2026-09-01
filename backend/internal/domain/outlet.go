package domain

import "time"

// Outlet represents a distinct department/business unit (Cafe, Bar, Mart, Restaurant)
type Outlet struct {
	ID          uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string    `gorm:"size:100;not null" json:"name"`
	Code        string    `gorm:"size:50;uniqueIndex;not null" json:"code"` // CAFE, BAR, MART, REST
	Type        string    `gorm:"size:50;not null;default:'dine_in'" json:"type"` // cafe, bar, retail, dine_in
	Description *string   `gorm:"type:text" json:"description"`
	HasTables   bool      `gorm:"default:true" json:"has_tables"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Zones       []Zone    `gorm:"foreignKey:OutletID" json:"zones,omitempty"`
	Stations    []Station `gorm:"foreignKey:OutletID" json:"stations,omitempty"`
}

// Zone represents a physical area or floor within an outlet (e.g. Ground Terrace, Rooftop 45F)
type Zone struct {
	ID          uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	OutletID    uint64    `gorm:"not null" json:"outlet_id"`
	Name        string    `gorm:"size:100;not null" json:"name"`
	FloorNumber int       `gorm:"default:1" json:"floor_number"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Station represents a KDS station, Barista prep screen, Bar counter, or printer
type Station struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	OutletID  uint64    `gorm:"not null" json:"outlet_id"`
	Name      string    `gorm:"size:100;not null" json:"name"`
	Type      string    `gorm:"size:50;not null;default:'kds'" json:"type"` // kds, printer, cashier
	IPAddress *string   `gorm:"size:45" json:"ip_address,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// CreateOutletRequest is the payload for creating a new outlet
type CreateOutletRequest struct {
	Name        string  `json:"name" binding:"required"`
	Code        string  `json:"code" binding:"required"`
	Type        string  `json:"type" binding:"required"`
	Description *string `json:"description"`
	HasTables   bool    `json:"has_tables"`
	IsActive    bool    `json:"is_active"`
}

// UpdateOutletRequest is the payload for updating an outlet
type UpdateOutletRequest struct {
	Name        *string `json:"name"`
	Code        *string `json:"code"`
	Type        *string `json:"type"`
	Description *string `json:"description"`
	HasTables   *bool   `json:"has_tables"`
	IsActive    *bool   `json:"is_active"`
}

// CreateZoneRequest is the payload for creating a new zone
type CreateZoneRequest struct {
	OutletID    uint64 `json:"outlet_id"`
	Name        string `json:"name" binding:"required"`
	FloorNumber int    `json:"floor_number"`
}

// UpdateZoneRequest is the payload for updating an existing zone
type UpdateZoneRequest struct {
	OutletID    *uint64 `json:"outlet_id"`
	Name        *string `json:"name"`
	FloorNumber *int    `json:"floor_number"`
}

// CreateStationRequest is the payload for creating a new station
type CreateStationRequest struct {
	OutletID  uint64  `json:"outlet_id"`
	Name      string  `json:"name" binding:"required"`
	Type      string  `json:"type" binding:"required"` // kds, printer, cashier
	IPAddress *string `json:"ip_address"`
}

// UpdateStationRequest is the payload for updating an existing station
type UpdateStationRequest struct {
	OutletID  *uint64 `json:"outlet_id"`
	Name      *string `json:"name"`
	Type      *string `json:"type"`
	IPAddress *string `json:"ip_address"`
}
