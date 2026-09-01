package auth

import (
	"github.com/pos-system/backend/internal/user"
)

// LoginRequest payload
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse payload
type LoginResponse struct {
	Token string     `json:"token"`
	User  *user.User `json:"user"`
}
