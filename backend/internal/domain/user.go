package domain

import "time"

// User represents a system user (admin, cashier, kitchen)
type User struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	RoleID    uint64    `gorm:"not null" json:"role_id"`
	Name      string    `gorm:"size:255;not null" json:"name"`
	Username  string    `gorm:"uniqueIndex;size:100;not null" json:"username"`
	Email     *string   `gorm:"uniqueIndex;size:255" json:"email"`
	Password  string    `gorm:"size:255;not null" json:"-"`
	IsActive  bool      `gorm:"default:true" json:"is_active"`
	CreatedBy *uint64   `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Role      *Role     `gorm:"foreignKey:RoleID" json:"role,omitempty"`
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
	RoleID   uint64  `json:"role_id" binding:"required"`
	Name     string  `json:"name" binding:"required"`
	Username string  `json:"username" binding:"required"`
	Email    *string `json:"email"`
	Password string  `json:"password" binding:"required,min=6"`
}

// UpdateUserRequest is the payload for updating a user
type UpdateUserRequest struct {
	RoleID   *uint64 `json:"role_id"`
	Name     *string `json:"name"`
	Email    *string `json:"email"`
	Password *string `json:"password"`
	IsActive *bool   `json:"is_active"`
}
