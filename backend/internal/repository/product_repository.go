package repository

import (
	"github.com/google/uuid"
	"github.com/pos-system/backend/internal/domain"
	"gorm.io/gorm"
)

// ProductRepository handles product and category database operations
type ProductRepository struct {
	db *gorm.DB
}

// NewProductRepository creates a new ProductRepository
func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

// --- Categories ---

// ListCategories returns all active categories with children
func (r *ProductRepository) ListCategories() ([]domain.Category, error) {
	var cats []domain.Category
	err := r.db.Where("is_active = true AND parent_id IS NULL").
		Preload("Children").Order("sort_order").Find(&cats).Error
	return cats, err
}

// CreateCategory inserts a new category
func (r *ProductRepository) CreateCategory(cat *domain.Category) error {
	return r.db.Create(cat).Error
}

// UpdateCategory saves changes to a category
func (r *ProductRepository) UpdateCategory(cat *domain.Category) error {
	return r.db.Save(cat).Error
}

// --- Products ---

// ListProducts returns all products, optionally filtered by category
func (r *ProductRepository) ListProducts(categoryID uuid.UUID, onlyAvailable bool) ([]domain.Product, error) {
	var products []domain.Product
	q := r.db.Preload("Category").Preload("OptionGroups.Values")
	if categoryID != uuid.Nil {
		q = q.Where("category_id = ?", categoryID)
	}
	if onlyAvailable {
		q = q.Where("is_available = true")
	}
	err := q.Find(&products).Error
	return products, err
}

// FindProductByID returns a single product with option groups
func (r *ProductRepository) FindProductByID(id uuid.UUID) (*domain.Product, error) {
	var product domain.Product
	err := r.db.Preload("Category").Preload("OptionGroups.Values").First(&product, id).Error
	return &product, err
}

// CreateProduct inserts a new product
func (r *ProductRepository) CreateProduct(p *domain.Product) error {
	return r.db.Create(p).Error
}

// UpdateProduct saves changes to a product
func (r *ProductRepository) UpdateProduct(p *domain.Product) error {
	return r.db.Save(p).Error
}

// DeleteProduct soft-deletes by marking unavailable
func (r *ProductRepository) DeleteProduct(id uuid.UUID) error {
	return r.db.Model(&domain.Product{}).Where("id = ?", id).Update("is_available", false).Error
}

// --- Option Groups ---

// ListOptionGroups returns all option groups with their values
func (r *ProductRepository) ListOptionGroups() ([]domain.OptionGroup, error) {
	var groups []domain.OptionGroup
	err := r.db.Preload("Values").Find(&groups).Error
	return groups, err
}

// CreateOptionGroup inserts a new option group
func (r *ProductRepository) CreateOptionGroup(g *domain.OptionGroup) error {
	return r.db.Create(g).Error
}

// AssignOptionGroupsToProduct links option groups to a product
func (r *ProductRepository) AssignOptionGroupsToProduct(productID uuid.UUID, groupIDs []uuid.UUID) error {
	product := domain.Product{}
	product.ID = productID
	var groups []domain.OptionGroup
	r.db.Where("id IN ?", groupIDs).Find(&groups)
	return r.db.Model(&product).Association("OptionGroups").Replace(groups)
}
