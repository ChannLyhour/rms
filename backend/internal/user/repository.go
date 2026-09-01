package user

import (
	"github.com/pos-system/backend/pkg/pagination"
	"gorm.io/gorm"
)

type Repository interface {
	FindByUsername(username string) (*User, error)
	FindByID(id uint64) (*User, error)
	List(search string, roleID *uint64, p pagination.Params) ([]User, int64, error)
	Create(u *User) error
	Update(u *User) error
	UpdateToken(id uint64, token *string) error
	Delete(id uint64) error

	// Roles
	ListRoles(p pagination.Params) ([]Role, int64, error)
	GetRoleByID(id uint64) (*Role, error)
	CreateRole(r *Role) error
	UpdateRole(id uint64, r *Role) error
	DeleteRole(id uint64) error

	// Permissions
	ListPermissions(p pagination.Params) ([]Permission, int64, error)
	AssignPermission(roleID, permID uint64) error
	RevokePermission(roleID, permID uint64) error
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
		Where("username = ? AND is_active = true", username).
		First(&u).Error
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *repository) FindByID(id uint64) (*User, error) {
	var u User
	err := r.db.
		Preload("Role").
		Preload("Role.Permissions").
		Preload("Outlet").
		First(&u, id).Error
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *repository) List(search string, roleID *uint64, p pagination.Params) ([]User, int64, error) {
	var users []User
	var total int64

	q := r.db.Model(&User{}).Preload("Role").Preload("Outlet")
	if search != "" {
		s := "%" + search + "%"
		q = q.Where("name ILIKE ? OR username ILIKE ? OR email ILIKE ?", s, s, s)
	}
	if roleID != nil && *roleID > 0 {
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

func (r *repository) UpdateToken(id uint64, token *string) error {
	return r.db.Model(&User{}).Where("id = ?", id).Update("token", token).Error
}

func (r *repository) Delete(id uint64) error {
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

func (r *repository) GetRoleByID(id uint64) (*Role, error) {
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

func (r *repository) UpdateRole(id uint64, role *Role) error {
	return r.db.Model(&Role{}).Where("id = ?", id).Updates(role).Error
}

func (r *repository) DeleteRole(id uint64) error {
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

func (r *repository) AssignPermission(roleID, permID uint64) error {
	rp := RolePermission{RoleID: roleID, PermissionID: permID}
	return r.db.FirstOrCreate(&rp).Error
}

func (r *repository) RevokePermission(roleID, permID uint64) error {
	return r.db.Where("role_id = ? AND permission_id = ?", roleID, permID).Delete(&RolePermission{}).Error
}
