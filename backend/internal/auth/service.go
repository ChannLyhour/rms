package auth

import (
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/pos-system/backend/internal/user"
	"github.com/pos-system/backend/pkg/jwt"
	"github.com/pos-system/backend/pkg/utils"
)

type Service interface {
	Login(req *LoginRequest) (*LoginResponse, error)
	ValidateToken(tokenStr string) (*jwt.Claims, error)
	GetProfile(userID uuid.UUID) (*user.User, error)
}

type service struct {
	userRepo   user.Repository
	jwtSecret  string
	jwtExpires int
}

func NewService(userRepo user.Repository, secret string, expiresHours int) Service {
	return &service{
		userRepo:   userRepo,
		jwtSecret:  secret,
		jwtExpires: expiresHours,
	}
}

func (s *service) Login(req *LoginRequest) (*LoginResponse, error) {
	usr, err := s.userRepo.FindByUsername(req.Username)
	if err != nil {
		return nil, errors.New("invalid username or password")
	}

	if !utils.CheckPasswordHash(req.Password, usr.Password) {
		return nil, errors.New("invalid username or password")
	}

	var perms []string
	if usr.Role != nil {
		for _, p := range usr.Role.Permissions {
			perms = append(perms, p.Slug)
		}
	}

	roleName := ""
	if usr.Role != nil {
		roleName = usr.Role.Name
	}

	token, err := jwt.GenerateToken(s.jwtSecret, s.jwtExpires, usr.ID, usr.Username, roleName, perms)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	// Persist active token on user in database
	usr.Token = &token
	_ = s.userRepo.UpdateToken(usr.ID, &token)

	// Remove hashed password from user response object
	usr.Password = ""
	return &LoginResponse{Token: token, User: usr}, nil
}

func (s *service) ValidateToken(tokenStr string) (*jwt.Claims, error) {
	return jwt.ParseToken(tokenStr, s.jwtSecret)
}

func (s *service) GetProfile(userID uuid.UUID) (*user.User, error) {
	usr, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, err
	}
	usr.Password = ""
	return usr, nil
}
