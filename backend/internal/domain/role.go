package domain

import (
	"time"

	"github.com/google/uuid"
)

// Role represents a user role with permissions
type Role struct {
	ID          uuid.UUID    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name        string       `gorm:"uniqueIndex;size:50;not null" json:"name"`
	DisplayName string       `gorm:"size:100;not null" json:"display_name"`
	Description string       `gorm:"size:255" json:"description"`
	CreatedBy   *uuid.UUID   `gorm:"type:uuid" json:"created_by"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
	Permissions []Permission `gorm:"many2many:role_permissions;" json:"permissions,omitempty"`
}

// Permission represents a single system permission
type Permission struct {
	ID          uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Slug        string     `gorm:"uniqueIndex;size:100;not null" json:"slug"`
	Name        string     `gorm:"size:100;not null" json:"name"`
	Module      string     `gorm:"size:50;not null" json:"module"`
	Description *string    `gorm:"size:255" json:"description,omitempty"`
	CreatedBy   *uuid.UUID `gorm:"type:uuid" json:"created_by"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// RolePermission is the join table for role_permissions
type RolePermission struct {
	RoleID       uuid.UUID  `gorm:"type:uuid;primaryKey" json:"role_id"`
	PermissionID uuid.UUID  `gorm:"type:uuid;primaryKey" json:"permission_id"`
	CreatedBy    *uuid.UUID `gorm:"type:uuid" json:"created_by"`
}
