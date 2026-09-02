package user

import (
	"github.com/google/uuid"
	"github.com/pos-system/backend/pkg/pagination"
	"gorm.io/gorm"
)

type Repository interface {
	FindByUsername(username string) (*User, error)
	FindByID(id uuid.UUID) (*User, error)
	List(search string, roleID *uuid.UUID, p pagination.Params) ([]User, int64, error)
	Create(u *User) error
	Update(u *User) error
	UpdateToken(id uuid.UUID, token *string) error
	Delete(id uuid.UUID) error
	SetUserOutlets(userID uuid.UUID, outletIDs []uuid.UUID) error

	// Roles
	ListRoles(p pagination.Params) ([]Role, int64, error)
	GetRoleByID(id uuid.UUID) (*Role, error)
	CreateRole(r *Role) error
	UpdateRole(id uuid.UUID, r *Role) error
	DeleteRole(id uuid.UUID) error

	// Permissions
	ListPermissions(p pagination.Params) ([]Permission, int64, error)
	AssignPermission(roleID, permID uuid.UUID) error
	RevokePermission(roleID, permID uuid.UUID) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) FindByUsername(username string) (*User, error) {
	var u User
	err := r.db.
		Preload("Role").
		Preload("Role.Permissions").
		Preload("Outlet").
		Preload("Outlets").
		Where("username = ? AND is_active = true", username).
		First(&u).Error
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *repository) FindByID(id uuid.UUID) (*User, error) {
	var u User
	err := r.db.
		Preload("Role").
		Preload("Role.Permissions").
		Preload("Outlet").
		Preload("Outlets").
		First(&u, id).Error
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *repository) List(search string, roleID *uuid.UUID, p pagination.Params) ([]User, int64, error) {
	var users []User
	var total int64

	q := r.db.Model(&User{}).Preload("Role").Preload("Outlet").Preload("Outlets")
	if search != "" {
		s := "%" + search + "%"
		q = q.Where("name ILIKE ? OR username ILIKE ? OR email ILIKE ?", s, s, s)
	}
	if roleID != nil && *roleID != uuid.Nil {
		q = q.Where("role_id = ?", *roleID)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("id asc").Limit(p.Limit).Offset(p.Offset).Find(&users).Error
	return users, total, err
}

func (r *repository) Create(u *User) error {
	return r.db.Create(u).Error
}

func (r *repository) Update(u *User) error {
	return r.db.Save(u).Error
}

func (r *repository) SetUserOutlets(userID uuid.UUID, outletIDs []uuid.UUID) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec("DELETE FROM user_outlets WHERE user_id = ?", userID).Error; err != nil {
			return err
		}
		for _, oid := range outletIDs {
			if oid != uuid.Nil {
				if err := tx.Exec("INSERT INTO user_outlets (user_id, outlet_id) VALUES (?, ?) ON CONFLICT DO NOTHING", userID, oid).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
}

func (r *repository) UpdateToken(id uuid.UUID, token *string) error {
	return r.db.Model(&User{}).Where("id = ?", id).Update("token", token).Error
}

func (r *repository) Delete(id uuid.UUID) error {
	return r.db.Delete(&User{}, id).Error
}

func (r *repository) ListRoles(p pagination.Params) ([]Role, int64, error) {
	var roles []Role
	var total int64

	q := r.db.Model(&Role{}).Preload("Permissions")
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("id asc").Limit(p.Limit).Offset(p.Offset).Find(&roles).Error
	return roles, total, err
}

func (r *repository) GetRoleByID(id uuid.UUID) (*Role, error) {
	var role Role
	err := r.db.Preload("Permissions").First(&role, id).Error
	if err != nil {
		return nil, err
	}
	return &role, nil
}

func (r *repository) CreateRole(role *Role) error {
	return r.db.Create(role).Error
}

func (r *repository) UpdateRole(id uuid.UUID, role *Role) error {
	return r.db.Model(&Role{}).Where("id = ?", id).Updates(role).Error
}

func (r *repository) DeleteRole(id uuid.UUID) error {
	return r.db.Delete(&Role{}, id).Error
}

func (r *repository) ListPermissions(p pagination.Params) ([]Permission, int64, error) {
	var perms []Permission
	var total int64

	q := r.db.Model(&Permission{})
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("id asc").Limit(p.Limit).Offset(p.Offset).Find(&perms).Error
	return perms, total, err
}

func (r *repository) AssignPermission(roleID, permID uuid.UUID) error {
	rp := RolePermission{RoleID: roleID, PermissionID: permID}
	return r.db.FirstOrCreate(&rp).Error
}

func (r *repository) RevokePermission(roleID, permID uuid.UUID) error {
	return r.db.Where("role_id = ? AND permission_id = ?", roleID, permID).Delete(&RolePermission{}).Error
}
