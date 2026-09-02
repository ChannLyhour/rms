package system

import (
	"time"

	"github.com/google/uuid"
)

// Setting represents application key-value configuration
type Setting struct {
	ID           uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	SettingKey   string     `gorm:"size:100;not null;unique" json:"setting_key"`
	SettingValue *string    `json:"setting_value"`
	CreatedBy    *uuid.UUID `gorm:"type:uuid" json:"created_by"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

func (Setting) TableName() string {
	return "system_settings"
}

// OrderStatusLog tracks status transitions for audit
type OrderStatusLog struct {
	ID              uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OrderID         uuid.UUID  `gorm:"type:uuid;not null" json:"order_id"`
	ChangedByUserID *uuid.UUID `gorm:"type:uuid" json:"changed_by_user_id"`
	StatusFrom      string     `gorm:"size:50;not null" json:"status_from"`
	StatusTo        string     `gorm:"size:50;not null" json:"status_to"`
	CreatedBy       *uuid.UUID `gorm:"type:uuid" json:"created_by"`
	CreatedAt       time.Time  `json:"created_at"`
}

func (OrderStatusLog) TableName() string {
	return "order_status_logs"
}
