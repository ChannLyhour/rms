package auth

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/pos-system/backend/pkg/jwt"
)

// AuthMiddleware validates JWT Bearer token
func AuthMiddleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization format must be Bearer <token>"})
			return
		}

		claims, err := jwt.ParseToken(parts[1], secret)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.RoleName)
		c.Set("permissions", claims.Perms)
		c.Next()
	}
}

// RequireRole enforces role-based access
func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		roleStr, ok := userRole.(string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "invalid role"})
			return
		}

		for _, r := range roles {
			if r == roleStr {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
	}
}

// RequirePermission enforces fine-grained permission slugs
func RequirePermission(permission string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get("role")
		if role == "admin" {
			c.Next()
			return
		}

		permsVal, exists := c.Get("permissions")
		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "no permissions found"})
			return
		}

		perms, ok := permsVal.([]string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "invalid permissions format"})
			return
		}

		for _, p := range perms {
			if p == permission {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "permission denied: " + permission})
	}
}

// RequireRoleOrPermission allows access if the user has one of the roles OR one of the permissions.
// If the user's role is "admin", access is always granted.
func RequireRoleOrPermission(roles []string, permissions ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, _ := c.Get("role")
		roleStr, _ := userRole.(string)
		if roleStr == "admin" {
			c.Next()
			return
		}

		for _, r := range roles {
			if r == roleStr {
				c.Next()
				return
			}
		}

		permsVal, exists := c.Get("permissions")
		if exists {
			if perms, ok := permsVal.([]string); ok {
				for _, requiredP := range permissions {
					for _, userP := range perms {
						if userP == requiredP {
							c.Next()
							return
						}
					}
				}
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
	}
}

