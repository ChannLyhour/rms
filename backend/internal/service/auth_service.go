package service

import (
	"errors"
	"fmt"

	"github.com/pos-system/backend/internal/domain"
	"github.com/pos-system/backend/internal/repository"
	jwtpkg "github.com/pos-system/backend/pkg/jwt"
	"golang.org/x/crypto/bcrypt"
)

// AuthService handles authentication business logic
type AuthService struct {
	userRepo   *repository.UserRepository
	jwtSecret  string
	jwtExpires int
}

// NewAuthService creates a new AuthService
func NewAuthService(userRepo *repository.UserRepository, secret string, expiresHours int) *AuthService {
	return &AuthService{
		userRepo:   userRepo,
		jwtSecret:  secret,
		jwtExpires: expiresHours,
	}
}

// Login validates credentials and returns a signed JWT with user data
func (s *AuthService) Login(req *domain.LoginRequest) (*domain.LoginResponse, error) {
	user, err := s.userRepo.FindByUsername(req.Username)
	if err != nil {
		return nil, errors.New("invalid username or password")
	}

	// Compare password — support both bcrypt $2y$ (PHP) and $2a$ (Go) prefixes
	hash := user.Password
	if len(hash) > 3 && hash[2] == 'y' {
		hash = "$2a$" + hash[4:]
	}
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid username or password")
	}

	// Build permission slug list
	var perms []string
	if user.Role != nil {
		for _, p := range user.Role.Permissions {
			perms = append(perms, p.Slug)
		}
	}

	roleName := ""
	if user.Role != nil {
		roleName = user.Role.Name
	}

	token, err := jwtpkg.GenerateToken(s.jwtSecret, s.jwtExpires, user.ID, user.Username, roleName, perms)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	// Hide password from response
	user.Password = ""
	return &domain.LoginResponse{Token: token, User: user}, nil
}
