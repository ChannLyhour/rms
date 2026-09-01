package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pos-system/backend/internal/domain"
	"github.com/pos-system/backend/internal/middleware"
	"github.com/pos-system/backend/internal/service"
)

// AuthHandler handles authentication endpoints
type AuthHandler struct {
	authSvc *service.AuthService
}

// NewAuthHandler creates a new AuthHandler
func NewAuthHandler(svc *service.AuthService) *AuthHandler {
	return &AuthHandler{authSvc: svc}
}

// Login godoc
// POST /api/v1/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req domain.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.authSvc.Login(&req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

// Me godoc
// GET /api/v1/auth/me
func (h *AuthHandler) Me(c *gin.Context) {
	claims := middleware.GetClaims(c)
	if claims == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"user_id":   claims.UserID,
		"username":  claims.Username,
		"role_name": claims.RoleName,
		"perms":     claims.Perms,
	})
}

// Logout godoc — client simply discards the token; server responds 200
// POST /api/v1/auth/logout
func (h *AuthHandler) Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "logged out"})
}
