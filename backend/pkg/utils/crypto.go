package utils

import (
	"golang.org/x/crypto/bcrypt"
)

// HashPassword generates a bcrypt hash of the password
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash compares a raw password with a bcrypt hash
func CheckPasswordHash(password, hash string) bool {
	// Support both $2y$ and $2a$ prefixes
	if len(hash) > 3 && hash[2] == 'y' {
		hash = "$2a$" + hash[4:]
	}
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}
