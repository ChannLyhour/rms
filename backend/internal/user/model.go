package user

import (
	"time"

	"github.com/google/uuid"
	"github.com/pos-system/backend/internal/domain"
)

// Role represents a system role (admin, cashier, kitchen)
type Role struct {
	ID          uuid.UUID    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name        string       `gorm:"uniqueIndex;size:50;not null" json:"name"`
	DisplayName string       `gorm:"size:100;not null" json:"display_name"`
	Description *string      `gorm:"size:255" json:"description"`
	CreatedBy   *uuid.UUID   `gorm:"type:uuid" json:"created_by"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
	Permissions []Permission `gorm:"many2many:role_permissions;" json:"permissions,omitempty"`
}

// Permission represents a fine-grained RBAC permission
type Permission struct {
	ID          uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Slug        string     `gorm:"uniqueIndex;size:100;not null" json:"slug"`
	Name        string     `gorm:"size:100;not null" json:"name"`
	Module      string     `gorm:"size:50;not null" json:"module"`
	Description *string    `gorm:"size:255" json:"description"`
	CreatedBy   *uuid.UUID `gorm:"type:uuid" json:"created_by"`
	CreatedAt   time.Time  `json:"created_at"`
}

// RolePermission is the join table between roles and permissions
type RolePermission struct {
	RoleID       uuid.UUID  `gorm:"type:uuid;primaryKey" json:"role_id"`
	PermissionID uuid.UUID  `gorm:"type:uuid;primaryKey" json:"permission_id"`
	CreatedBy    *uuid.UUID `gorm:"type:uuid" json:"created_by"`
}

// User represents a staff or system user account
type User struct {
	ID        uuid.UUID       `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	RoleID    uuid.UUID       `gorm:"type:uuid;not null" json:"role_id"`
	OutletID  *uuid.UUID      `gorm:"type:uuid" json:"outlet_id"`
	Name      string          `gorm:"size:255;not null" json:"name"`
	Username  string          `gorm:"uniqueIndex;size:100;not null" json:"username"`
	Email     *string         `gorm:"uniqueIndex;size:255" json:"email"`
	Phone     *string         `gorm:"size:50" json:"phone"`
	ImageURL  *string         `gorm:"type:text" json:"image_url"`
	Password  string          `gorm:"size:255;not null" json:"-"`
	Token     *string         `gorm:"type:text" json:"token,omitempty"`
	IsActive  bool            `gorm:"default:true" json:"is_active"`
	CreatedBy *uuid.UUID      `gorm:"type:uuid" json:"created_by"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
	Role      *Role           `gorm:"foreignKey:RoleID" json:"role,omitempty"`
	Outlet    *domain.Outlet  `gorm:"foreignKey:OutletID" json:"outlet,omitempty"`
	Outlets   []domain.Outlet `gorm:"many2many:user_outlets;joinForeignKey:UserID;joinReferences:OutletID" json:"outlets,omitempty"`
}

// UserOutlet represents the many-to-many join table between users and outlets
type UserOutlet struct {
	UserID   uuid.UUID `gorm:"type:uuid;primaryKey" json:"user_id"`
	OutletID uuid.UUID `gorm:"type:uuid;primaryKey" json:"outlet_id"`
}

func (UserOutlet) TableName() string {
	return "user_outlets"
}

// CreateUserRequest payload
type CreateUserRequest struct {
	RoleID    uuid.UUID   `json:"role_id" binding:"required"`
	OutletID  *uuid.UUID  `json:"outlet_id"`
	OutletIDs []uuid.UUID `json:"outlet_ids"`
	Name      string      `json:"name" binding:"required"`
	Username  string      `json:"username" binding:"required"`
	Email     *string     `json:"email"`
	Phone     *string     `json:"phone"`
	ImageURL  *string     `json:"image_url"`
	Password  string      `json:"password" binding:"required,min=6"`
	IsActive  *bool       `json:"is_active"`
}

// UpdateUserRequest payload
type UpdateUserRequest struct {
	RoleID    *uuid.UUID   `json:"role_id"`
	OutletID  *uuid.UUID   `json:"outlet_id"`
	OutletIDs *[]uuid.UUID `json:"outlet_ids"`
	Name      *string      `json:"name"`
	Username  *string      `json:"username"`
	Email     *string      `json:"email"`
	Phone     *string      `json:"phone"`
	ImageURL  *string      `json:"image_url"`
	Password  *string      `json:"password"`
	Token     *string      `json:"token"`
	IsActive  *bool        `json:"is_active"`
}
