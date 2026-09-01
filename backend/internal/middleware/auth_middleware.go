package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	jwtpkg "github.com/pos-system/backend/pkg/jwt"
)

const UserClaimsKey = "user_claims"

// AuthMiddleware validates the Bearer JWT and stores claims in the Gin context
func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authorization header required"})
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization format"})
			return
		}

		claims, err := jwtpkg.ParseToken(parts[1], jwtSecret)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			return
		}

		c.Set(UserClaimsKey, claims)
		c.Next()
	}
}

// GetClaims retrieves the JWT claims stored by AuthMiddleware
func GetClaims(c *gin.Context) *jwtpkg.Claims {
	v, exists := c.Get(UserClaimsKey)
	if !exists {
		return nil
	}
	claims, _ := v.(*jwtpkg.Claims)
	return claims
}
