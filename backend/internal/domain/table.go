package domain

import "time"

// Table represents a physical restaurant table
type Table struct {
	ID          uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	TableNumber string    `gorm:"uniqueIndex;size:50;not null" json:"table_number"`
	Capacity    int       `gorm:"default:4" json:"capacity"`
	Status      string    `gorm:"size:20;default:'available'" json:"status"` // available | occupied | reserved
	CreatedBy   *uint64   `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// TableSession represents an active QR session for a table
type TableSession struct {
	ID           uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	TableID      uint64     `gorm:"not null" json:"table_id"`
	SessionToken string     `gorm:"uniqueIndex;size:255;not null" json:"session_token"`
	Status       string     `gorm:"size:20;default:'active'" json:"status"` // active | closed
	OpenedAt     time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"opened_at"`
	ClosedAt     *time.Time `json:"closed_at"`
	CreatedBy    *uint64    `json:"created_by"`
	Table        *Table     `gorm:"foreignKey:TableID" json:"table,omitempty"`
	Orders       []Order    `gorm:"foreignKey:TableSessionID" json:"orders,omitempty"`
}

// OpenSessionRequest is the payload for opening a new table session
type OpenSessionRequest struct {
	TableID uint64 `json:"table_id" binding:"required"`
}
