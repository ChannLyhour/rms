package table

import (
	"time"

	"github.com/pos-system/backend/internal/enum"
)

// Table represents a physical dining table
type Table struct {
	ID          uint64           `gorm:"primaryKey;autoIncrement" json:"id"`
	TableNumber string           `gorm:"uniqueIndex;size:50;not null" json:"table_number"`
	Capacity    int              `gorm:"default:4" json:"capacity"`
	Status      enum.TableStatus `gorm:"size:20;default:'available'" json:"status"` // available | occupied | reserved | cleaning
	CreatedBy   *uint64          `json:"created_by"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
}

// TableSession represents an active or past QR ordering session
type TableSession struct {
	ID           uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	TableID      uint64         `gorm:"not null" json:"table_id"`
	SessionToken string         `gorm:"uniqueIndex;size:255;not null" json:"session_token"`
	Status       string         `gorm:"size:20;default:'active'" json:"status"` // active | closed
	OpenedAt     time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"opened_at"`
	ClosedAt     *time.Time     `json:"closed_at"`
	CreatedBy    *uint64        `json:"created_by"`
	Table        *Table         `gorm:"foreignKey:TableID" json:"table,omitempty"`
	Orders       []SessionOrder `gorm:"foreignKey:TableSessionID" json:"orders,omitempty"`
}

// SessionOrder represents order financial details for session calculation
type SessionOrder struct {
	ID             uint64           `gorm:"primaryKey;autoIncrement" json:"id"`
	TableSessionID uint64           `gorm:"not null" json:"table_session_id"`
	OrderNumber    string           `json:"order_number"`
	Status         enum.OrderStatus `json:"status"`
	TotalAmount    float64          `gorm:"type:numeric(10,2);default:0.00" json:"total_amount"`
}

func (SessionOrder) TableName() string {
	return "orders"
}

// OpenSessionRequest payload
type OpenSessionRequest struct {
	TableID uint64 `json:"table_id" binding:"required"`
}

// SessionWithQR includes generated QR code and menu URL
type SessionWithQR struct {
	Session *TableSession `json:"session"`
	QRURL   string        `json:"qr_url"`
	QRImage string        `json:"qr_image"`
}
