package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/pos-system/backend/internal/enum"
)

// Table represents a physical restaurant table
type Table struct {
	ID          uuid.UUID        `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OutletID    *uuid.UUID       `gorm:"type:uuid" json:"outlet_id"`
	ZoneID      *uuid.UUID       `gorm:"type:uuid" json:"zone_id"`
	TableNumber string           `gorm:"uniqueIndex;size:50;not null" json:"table_number"`
	Capacity    int              `gorm:"default:4" json:"capacity"`
	Status      enum.TableStatus `gorm:"size:20;default:'available'" json:"status"` // available | occupied | reserved | cleaning
	CreatedBy   *uuid.UUID       `gorm:"type:uuid" json:"created_by"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
	Outlet      *Outlet          `gorm:"foreignKey:OutletID" json:"outlet,omitempty"`
	Zone        *Zone            `gorm:"foreignKey:ZoneID" json:"zone,omitempty"`
}

// TableSession represents an active QR session for a table
type TableSession struct {
	ID           uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	TableID      uuid.UUID  `gorm:"type:uuid;not null" json:"table_id"`
	SessionToken string     `gorm:"uniqueIndex;size:255;not null" json:"session_token"`
	Status       string     `gorm:"size:20;default:'active'" json:"status"` // active | closed
	OpenedAt     time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"opened_at"`
	ClosedAt     *time.Time `json:"closed_at"`
	CreatedBy    *uuid.UUID `gorm:"type:uuid" json:"created_by"`
	Table        *Table     `gorm:"foreignKey:TableID" json:"table,omitempty"`
	Orders       []Order    `gorm:"foreignKey:TableSessionID" json:"orders,omitempty"`
}

// OpenSessionRequest is the payload for opening a new table session
type OpenSessionRequest struct {
	TableID uuid.UUID `json:"table_id" binding:"required"`
}
