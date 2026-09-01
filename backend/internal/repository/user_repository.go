package repository

import (
	"github.com/pos-system/backend/internal/domain"
	"gorm.io/gorm"
)

// UserRepository handles all user database operations
type UserRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new UserRepository
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// FindByUsername returns a user with their role and permissions loaded
func (r *UserRepository) FindByUsername(username string) (*domain.User, error) {
	var user domain.User
	err := r.db.
		Preload("Role.Permissions").
		Where("username = ? AND is_active = true", username).
		First(&user).Error
	return &user, err
}

// FindByID returns a user by primary key
func (r *UserRepository) FindByID(id uint64) (*domain.User, error) {
	var user domain.User
	err := r.db.Preload("Role").First(&user, id).Error
	return &user, err
}

// List returns all users with pagination
func (r *UserRepository) List(page, limit int) ([]domain.User, int64, error) {
	var users []domain.User
	var total int64
	offset := (page - 1) * limit

	r.db.Model(&domain.User{}).Count(&total)
	err := r.db.Preload("Role").Offset(offset).Limit(limit).Find(&users).Error
	return users, total, err
}

// Create inserts a new user record
func (r *UserRepository) Create(user *domain.User) error {
	return r.db.Create(user).Error
}

// Update saves changes to an existing user
func (r *UserRepository) Update(user *domain.User) error {
	return r.db.Save(user).Error
}

// Delete soft-deactivates a user
func (r *UserRepository) Delete(id uint64) error {
	return r.db.Model(&domain.User{}).Where("id = ?", id).Update("is_active", false).Error
}
