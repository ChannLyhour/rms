package jwt

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Claims holds the JWT payload
type Claims struct {
	UserID   uint64   `json:"user_id"`
	Username string   `json:"username"`
	RoleName string   `json:"role_name"`
	Perms    []string `json:"perms"`
	jwt.RegisteredClaims
}

// GenerateToken creates a signed JWT for the given user
func GenerateToken(secret string, expiresInHours int, userID uint64, username, roleName string, perms []string) (string, error) {
	claims := &Claims{
		UserID:   userID,
		Username: username,
		RoleName: roleName,
		Perms:    perms,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(expiresInHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ParseToken validates and parses a JWT string, returning its claims
func ParseToken(tokenStr, secret string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}

// ValidateToken validates and parses a JWT string, returning its claims (alias for ParseToken)
func ValidateToken(tokenStr, secret string) (*Claims, error) {
	return ParseToken(tokenStr, secret)
}
