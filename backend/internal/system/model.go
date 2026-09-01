package system

import (
	"time"
)

// Setting represents application key-value configuration
type Setting struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	SettingKey   string    `gorm:"size:100;not null;unique" json:"setting_key"`
	SettingValue *string   `json:"setting_value"`
	CreatedBy    *uint64   `json:"created_by"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (Setting) TableName() string {
	return "system_settings"
}

// OrderStatusLog tracks status transitions for audit
type OrderStatusLog struct {
	ID              uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID         uint64    `gorm:"not null" json:"order_id"`
	ChangedByUserID *uint64   `json:"changed_by_user_id"`
	StatusFrom      string    `gorm:"size:50;not null" json:"status_from"`
	StatusTo        string    `gorm:"size:50;not null" json:"status_to"`
	CreatedBy       *uint64   `json:"created_by"`
	CreatedAt       time.Time `json:"created_at"`
}

func (OrderStatusLog) TableName() string {
	return "order_status_logs"
}
