package products

import (
	"github.com/pos-system/backend/pkg/pagination"
	"gorm.io/gorm"
)

type Repository interface {
	// Categories
	ListCategories(search string, p pagination.Params) ([]Category, int64, error)
	GetCategoryByID(id uint64) (*Category, error)
	CreateCategory(c *Category) error
	UpdateCategory(id uint64, c *Category) error
	DeleteCategory(id uint64) error

	// Products
	ListProducts(search string, categoryID *uint64, isAvailable *bool, p pagination.Params) ([]Product, int64, error)
	GetProductByID(id uint64) (*Product, error)
	CreateProduct(p *Product, optionGroupIDs []uint64) error
	UpdateProduct(p *Product, optionGroupIDs []uint64) error
	DeleteProduct(id uint64) error

	// Option Groups & Values
	ListOptionGroups(search string, p pagination.Params) ([]OptionGroup, int64, error)
	GetOptionGroupByID(id uint64) (*OptionGroup, error)
	CreateOptionGroup(g *OptionGroup) error
	UpdateOptionGroup(id uint64, g *OptionGroup) error
	DeleteOptionGroup(id uint64) error
	CreateOptionValue(v *OptionValue) error
	DeleteOptionValue(id uint64) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

// ── Categories ───────────────────────────────────────────────────

func (r *repository) ListCategories(search string, p pagination.Params) ([]Category, int64, error) {
	var cats []Category
	var total int64

	q := r.db.Model(&Category{}).Preload("Children")
	if search != "" {
		q = q.Where("name ILIKE ?", "%"+search+"%")
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("sort_order asc, id asc").Limit(p.Limit).Offset(p.Offset).Find(&cats).Error
	return cats, total, err
}

func (r *repository) GetCategoryByID(id uint64) (*Category, error) {
	var c Category
	if err := r.db.First(&c, id).Error; err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *repository) CreateCategory(c *Category) error {
	return r.db.Create(c).Error
}

func (r *repository) UpdateCategory(id uint64, c *Category) error {
	updates := map[string]interface{}{
		"name":        c.Name,
		"description": c.Description,
		"image_url":   c.ImageURL,
		"sort_order":  c.SortOrder,
		"is_active":   c.IsActive,
		"parent_id":   c.ParentID,
	}
	return r.db.Model(&Category{}).Where("id = ?", id).Updates(updates).Error
}

func (r *repository) DeleteCategory(id uint64) error {
	return r.db.Delete(&Category{}, id).Error
}

// ── Products ─────────────────────────────────────────────────────

func (r *repository) ListProducts(search string, categoryID *uint64, isAvailable *bool, p pagination.Params) ([]Product, int64, error) {
	var prods []Product
	var total int64

	q := r.db.Model(&Product{}).
		Preload("Category").
		Preload("OptionGroups").
		Preload("OptionGroups.Values")

	if search != "" {
		q = q.Where("name ILIKE ?", "%"+search+"%")
	}
	if categoryID != nil && *categoryID > 0 {
		q = q.Where("category_id = ?", *categoryID)
	}
	if isAvailable != nil {
		q = q.Where("is_available = ?", *isAvailable)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("id desc").Limit(p.Limit).Offset(p.Offset).Find(&prods).Error
	return prods, total, err
}

func (r *repository) GetProductByID(id uint64) (*Product, error) {
	var p Product
	err := r.db.
		Preload("Category").
		Preload("OptionGroups").
		Preload("OptionGroups.Values").
		First(&p, id).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *repository) CreateProduct(p *Product, optionGroupIDs []uint64) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(p).Error; err != nil {
			return err
		}
		for _, ogID := range optionGroupIDs {
			pog := ProductOptionGroup{ProductID: p.ID, OptionGroupID: ogID}
			if err := tx.Create(&pog).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *repository) UpdateProduct(p *Product, optionGroupIDs []uint64) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(p).Error; err != nil {
			return err
		}
		if optionGroupIDs != nil {
			if err := tx.Where("product_id = ?", p.ID).Delete(&ProductOptionGroup{}).Error; err != nil {
				return err
			}
			for _, ogID := range optionGroupIDs {
				pog := ProductOptionGroup{ProductID: p.ID, OptionGroupID: ogID}
				if err := tx.Create(&pog).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
}

func (r *repository) DeleteProduct(id uint64) error {
	return r.db.Delete(&Product{}, id).Error
}

// ── Option Groups ────────────────────────────────────────────────

func (r *repository) ListOptionGroups(search string, p pagination.Params) ([]OptionGroup, int64, error) {
	var groups []OptionGroup
	var total int64

	q := r.db.Model(&OptionGroup{}).Preload("Values")
	if search != "" {
		q = q.Where("name ILIKE ?", "%"+search+"%")
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("id asc").Limit(p.Limit).Offset(p.Offset).Find(&groups).Error
	return groups, total, err
}

func (r *repository) GetOptionGroupByID(id uint64) (*OptionGroup, error) {
	var g OptionGroup
	if err := r.db.Preload("Values").First(&g, id).Error; err != nil {
		return nil, err
	}
	return &g, nil
}

func (r *repository) CreateOptionGroup(g *OptionGroup) error {
	return r.db.Create(g).Error
}

func (r *repository) UpdateOptionGroup(id uint64, g *OptionGroup) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		updates := map[string]interface{}{
			"name":        g.Name,
			"type":        g.Type,
			"is_required": g.IsRequired,
		}
		if err := tx.Model(&OptionGroup{}).Where("id = ?", id).Updates(updates).Error; err != nil {
			return err
		}

		if len(g.Values) > 0 {
			if err := tx.Where("option_group_id = ?", id).Delete(&OptionValue{}).Error; err != nil {
				return err
			}
			for _, v := range g.Values {
				v.ID = 0
				v.OptionGroupID = id
				if err := tx.Create(&v).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
}

func (r *repository) DeleteOptionGroup(id uint64) error {
	return r.db.Delete(&OptionGroup{}, id).Error
}

func (r *repository) CreateOptionValue(v *OptionValue) error {
	return r.db.Create(v).Error
}

func (r *repository) DeleteOptionValue(id uint64) error {
	return r.db.Delete(&OptionValue{}, id).Error
}
