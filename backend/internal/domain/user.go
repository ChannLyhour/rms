package domain

import (
	"time"

	"github.com/google/uuid"
)

// User represents a system user (admin, cashier, kitchen)
type User struct {
	ID        uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	RoleID    uuid.UUID  `gorm:"type:uuid;not null" json:"role_id"`
	OutletID  *uuid.UUID `gorm:"type:uuid" json:"outlet_id"`
	Name      string     `gorm:"size:255;not null" json:"name"`
	Username  string     `gorm:"uniqueIndex;size:100;not null" json:"username"`
	Email     *string    `gorm:"uniqueIndex;size:255" json:"email"`
	Phone     *string    `gorm:"size:50" json:"phone"`
	ImageURL  *string    `gorm:"type:text" json:"image_url"`
	Password  string     `gorm:"size:255;not null" json:"-"`
	IsActive  bool       `gorm:"default:true" json:"is_active"`
	CreatedBy *uuid.UUID `gorm:"type:uuid" json:"created_by"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	Role      *Role      `gorm:"foreignKey:RoleID" json:"role,omitempty"`
	Outlet    *Outlet    `gorm:"foreignKey:OutletID" json:"outlet,omitempty"`
	Outlets   []Outlet   `gorm:"many2many:user_outlets;joinForeignKey:UserID;joinReferences:OutletID" json:"outlets,omitempty"`
}

// UserOutlet join table
type UserOutlet struct {
	UserID   uuid.UUID `gorm:"type:uuid;primaryKey" json:"user_id"`
	OutletID uuid.UUID `gorm:"type:uuid;primaryKey" json:"outlet_id"`
}

func (UserOutlet) TableName() string {
	return "user_outlets"
}

// LoginRequest is the payload for POST /auth/login
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse is the JWT response after successful login
type LoginResponse struct {
	Token string `json:"token"`
	User  *User  `json:"user"`
}

// CreateUserRequest is the payload for creating a new user
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

// UpdateUserRequest is the payload for updating a user
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
	IsActive  *bool        `json:"is_active"`
}
