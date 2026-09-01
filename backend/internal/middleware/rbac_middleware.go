package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RequirePermission returns a middleware that checks the user holds the given permission slug
func RequirePermission(slug string) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims := GetClaims(c)
		if claims == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		for _, p := range claims.Perms {
			if p == slug {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
			"error": "you do not have permission to perform this action",
		})
	}
}

// RequireRole returns a middleware that checks the user has one of the given role names
func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims := GetClaims(c)
		if claims == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		for _, r := range roles {
			if claims.RoleName == r {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
			"error": "insufficient role",
		})
	}
}
