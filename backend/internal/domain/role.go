package domain

import "time"

// Role represents a user role with permissions
type Role struct {
	ID          uint64      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string      `gorm:"uniqueIndex;size:50;not null" json:"name"`
	DisplayName string      `gorm:"size:100;not null" json:"display_name"`
	Description string      `gorm:"size:255" json:"description"`
	CreatedBy   *uint64     `json:"created_by"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
	Permissions []Permission `gorm:"many2many:role_permissions;" json:"permissions,omitempty"`
}

// Permission represents a single system permission
type Permission struct {
	ID          uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Slug        string    `gorm:"uniqueIndex;size:100;not null" json:"slug"`
	Name        string    `gorm:"size:100;not null" json:"name"`
	Module      string    `gorm:"size:50;not null" json:"module"`
	Description *string   `gorm:"size:255" json:"description,omitempty"`
	CreatedBy   *uint64   `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// RolePermission is the join table for role_permissions
type RolePermission struct {
	RoleID       uint64  `gorm:"primaryKey" json:"role_id"`
	PermissionID uint64  `gorm:"primaryKey" json:"permission_id"`
	CreatedBy    *uint64 `json:"created_by"`
}
