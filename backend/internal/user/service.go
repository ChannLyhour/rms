package user

import (
	"errors"

	"github.com/google/uuid"
	"github.com/pos-system/backend/pkg/pagination"
	"golang.org/x/crypto/bcrypt"
)

type Service interface {
	GetByID(id uuid.UUID) (*User, error)
	List(search string, roleID *uuid.UUID, p pagination.Params) ([]User, int64, error)
	Create(req *CreateUserRequest, creatorID *uuid.UUID) (*User, error)
	Update(id uuid.UUID, req *UpdateUserRequest) (*User, error)
	Delete(id uuid.UUID) error

	// Roles & Permissions
	ListRoles(p pagination.Params) ([]Role, int64, error)
	GetRole(id uuid.UUID) (*Role, error)
	CreateRole(r *Role) error
	UpdateRole(id uuid.UUID, r *Role) error
	DeleteRole(id uuid.UUID) error
	ListPermissions(p pagination.Params) ([]Permission, int64, error)
	AssignPermission(roleID, permID uuid.UUID) error
	RevokePermission(roleID, permID uuid.UUID) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) GetByID(id uuid.UUID) (*User, error) {
	return s.repo.FindByID(id)
}

func (s *service) List(search string, roleID *uuid.UUID, p pagination.Params) ([]User, int64, error) {
	return s.repo.List(search, roleID, p)
}

func (s *service) Create(req *CreateUserRequest, creatorID *uuid.UUID) (*User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	outletIDs := req.OutletIDs
	outletID := req.OutletID
	if outletID == nil && len(outletIDs) > 0 {
		outletID = &outletIDs[0]
	} else if outletID != nil && len(outletIDs) == 0 {
		outletIDs = []uuid.UUID{*outletID}
	}

	u := &User{
		RoleID:    req.RoleID,
		OutletID:  outletID,
		Name:      req.Name,
		Username:  req.Username,
		Email:     req.Email,
		Phone:     req.Phone,
		ImageURL:  req.ImageURL,
		Password:  string(hashedPassword),
		IsActive:  isActive,
		CreatedBy: creatorID,
	}

	if err := s.repo.Create(u); err != nil {
		return nil, err
	}

	if len(outletIDs) > 0 {
		_ = s.repo.SetUserOutlets(u.ID, outletIDs)
	}

	return s.repo.FindByID(u.ID)
}

func (s *service) Update(id uuid.UUID, req *UpdateUserRequest) (*User, error) {
	u, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("user not found")
	}

	if req.RoleID != nil {
		u.RoleID = *req.RoleID
	}
	if req.OutletID != nil {
		u.OutletID = req.OutletID
	}
	if req.OutletIDs != nil {
		_ = s.repo.SetUserOutlets(id, *req.OutletIDs)
		if len(*req.OutletIDs) > 0 && req.OutletID == nil {
			found := false
			if u.OutletID != nil {
				for _, oid := range *req.OutletIDs {
					if oid == *u.OutletID {
						found = true
						break
					}
				}
			}
			if !found {
				u.OutletID = &(*req.OutletIDs)[0]
			}
		} else if len(*req.OutletIDs) == 0 && req.OutletID == nil {
			u.OutletID = nil
		}
	}
	if req.Name != nil {
		u.Name = *req.Name
	}
	if req.Username != nil {
		u.Username = *req.Username
	}
	if req.Email != nil {
		u.Email = req.Email
	}
	if req.Phone != nil {
		u.Phone = req.Phone
	}
	if req.ImageURL != nil {
		u.ImageURL = req.ImageURL
	}
	if req.Password != nil && *req.Password != "" {
		hashed, err := bcrypt.GenerateFromPassword([]byte(*req.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, errors.New("failed to hash password")
		}
		u.Password = string(hashed)
	}
	if req.Token != nil {
		u.Token = req.Token
	}
	if req.IsActive != nil {
		u.IsActive = *req.IsActive
	}

	if err := s.repo.Update(u); err != nil {
		return nil, err
	}
	return s.repo.FindByID(id)
}

func (s *service) Delete(id uuid.UUID) error {
	return s.repo.Delete(id)
}

func (s *service) ListRoles(p pagination.Params) ([]Role, int64, error) {
	return s.repo.ListRoles(p)
}

func (s *service) GetRole(id uuid.UUID) (*Role, error) {
	return s.repo.GetRoleByID(id)
}

func (s *service) CreateRole(r *Role) error {
	return s.repo.CreateRole(r)
}

func (s *service) UpdateRole(id uuid.UUID, r *Role) error {
	return s.repo.UpdateRole(id, r)
}

func (s *service) DeleteRole(id uuid.UUID) error {
	return s.repo.DeleteRole(id)
}

func (s *service) ListPermissions(p pagination.Params) ([]Permission, int64, error) {
	return s.repo.ListPermissions(p)
}

func (s *service) AssignPermission(roleID, permID uuid.UUID) error {
	return s.repo.AssignPermission(roleID, permID)
}

func (s *service) RevokePermission(roleID, permID uuid.UUID) error {
	return s.repo.RevokePermission(roleID, permID)
}
