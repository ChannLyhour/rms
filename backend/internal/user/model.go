package user

import (
	"time"

	"github.com/pos-system/backend/internal/domain"
)

// Role represents a system role (admin, cashier, kitchen)
type Role struct {
	ID          uint64       `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string       `gorm:"uniqueIndex;size:50;not null" json:"name"`
	DisplayName string       `gorm:"size:100;not null" json:"display_name"`
	Description *string      `gorm:"size:255" json:"description"`
	CreatedBy   *uint64      `json:"created_by"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
	Permissions []Permission `gorm:"many2many:role_permissions;" json:"permissions,omitempty"`
}

// Permission represents a fine-grained RBAC permission
type Permission struct {
	ID          uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Slug        string    `gorm:"uniqueIndex;size:100;not null" json:"slug"`
	Name        string    `gorm:"size:100;not null" json:"name"`
	Module      string    `gorm:"size:50;not null" json:"module"`
	Description *string   `gorm:"size:255" json:"description"`
	CreatedBy   *uint64   `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
}

// RolePermission is the join table between roles and permissions
type RolePermission struct {
	RoleID       uint64  `gorm:"primaryKey" json:"role_id"`
	PermissionID uint64  `gorm:"primaryKey" json:"permission_id"`
	CreatedBy    *uint64 `json:"created_by"`
}

// User represents a staff or system user account
type User struct {
	ID        uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	RoleID    uint64         `gorm:"not null" json:"role_id"`
	OutletID  *uint64        `json:"outlet_id"`
	Name      string         `gorm:"size:255;not null" json:"name"`
	Username  string         `gorm:"uniqueIndex;size:100;not null" json:"username"`
	Email     *string        `gorm:"uniqueIndex;size:255" json:"email"`
	Phone     *string        `gorm:"size:50" json:"phone"`
	ImageURL  *string        `gorm:"type:text" json:"image_url"`
	Password  string         `gorm:"size:255;not null" json:"-"`
	Token     *string        `gorm:"type:text" json:"token,omitempty"`
	IsActive  bool           `gorm:"default:true" json:"is_active"`
	CreatedBy *uint64        `json:"created_by"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	Role      *Role          `gorm:"foreignKey:RoleID" json:"role,omitempty"`
	Outlet    *domain.Outlet `gorm:"foreignKey:OutletID" json:"outlet,omitempty"`
}

// CreateUserRequest payload
type CreateUserRequest struct {
	RoleID   uint64  `json:"role_id" binding:"required"`
	OutletID *uint64 `json:"outlet_id"`
	Name     string  `json:"name" binding:"required"`
	Username string  `json:"username" binding:"required"`
	Email    *string `json:"email"`
	Phone    *string `json:"phone"`
	ImageURL *string `json:"image_url"`
	Password string  `json:"password" binding:"required,min=6"`
	IsActive *bool   `json:"is_active"`
}

// UpdateUserRequest payload
type UpdateUserRequest struct {
	RoleID   *uint64 `json:"role_id"`
	OutletID *uint64 `json:"outlet_id"`
	Name     *string `json:"name"`
	Username *string `json:"username"`
	Email    *string `json:"email"`
	Phone    *string `json:"phone"`
	ImageURL *string `json:"image_url"`
	Password *string `json:"password"`
	Token    *string `json:"token"`
	IsActive *bool   `json:"is_active"`
}
