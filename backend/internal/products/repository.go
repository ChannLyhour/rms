package products

import (
	"github.com/google/uuid"
	"github.com/pos-system/backend/pkg/pagination"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Repository interface {
	// Categories
	ListCategories(search string, outletID *uuid.UUID, p pagination.Params) ([]Category, int64, error)
	GetCategoryByID(id uuid.UUID) (*Category, error)
	CreateCategory(c *Category) error
	UpdateCategory(id uuid.UUID, c *Category) error
	DeleteCategory(id uuid.UUID) error

	// Products
	ListProducts(search string, categoryID *uuid.UUID, outletID *uuid.UUID, isAvailable *bool, p pagination.Params) ([]Product, int64, error)
	GetProductByID(id uuid.UUID) (*Product, error)
	CreateProduct(p *Product, optionGroupIDs []uuid.UUID) error
	UpdateProduct(p *Product, optionGroupIDs *[]uuid.UUID) error
	DeleteProduct(id uuid.UUID) error

	// Option Groups & Values
	ListOptionGroups(search string, outletID *uuid.UUID, p pagination.Params) ([]OptionGroup, int64, error)
	GetOptionGroupByID(id uuid.UUID) (*OptionGroup, error)
	CreateOptionGroup(g *OptionGroup) error
	UpdateOptionGroup(id uuid.UUID, g *OptionGroup) error
	DeleteOptionGroup(id uuid.UUID) error
	CreateOptionValue(v *OptionValue) error
	DeleteOptionValue(id uuid.UUID) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

// ── Categories ───────────────────────────────────────────────────

func (r *repository) ListCategories(search string, outletID *uuid.UUID, p pagination.Params) ([]Category, int64, error) {
	var cats []Category
	var total int64

	q := r.db.Model(&Category{}).
		Preload("Outlet").
		Preload("Children").
		Preload("Children.Outlet")

	if search != "" {
		q = q.Where("name ILIKE ?", "%"+search+"%")
	}
	if outletID != nil && *outletID != uuid.Nil {
		q = q.Where("outlet_id = ?", *outletID)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("sort_order asc, id asc").Limit(p.Limit).Offset(p.Offset).Find(&cats).Error
	return cats, total, err
}

func (r *repository) GetCategoryByID(id uuid.UUID) (*Category, error) {
	var c Category
	if err := r.db.Preload("Outlet").Preload("Children").First(&c, id).Error; err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *repository) CreateCategory(c *Category) error {
	return r.db.Create(c).Error
}

func (r *repository) UpdateCategory(id uuid.UUID, c *Category) error {
	updates := map[string]interface{}{
		"outlet_id":   c.OutletID,
		"name":        c.Name,
		"description": c.Description,
		"image_url":   c.ImageURL,
		"sort_order":  c.SortOrder,
		"is_active":   c.IsActive,
		"parent_id":   c.ParentID,
	}
	return r.db.Model(&Category{}).Where("id = ?", id).Updates(updates).Error
}

func (r *repository) DeleteCategory(id uuid.UUID) error {
	return r.db.Delete(&Category{}, id).Error
}

// ── Products ─────────────────────────────────────────────────────

func (r *repository) ListProducts(search string, categoryID *uuid.UUID, outletID *uuid.UUID, isAvailable *bool, p pagination.Params) ([]Product, int64, error) {
	var prods []Product
	var total int64

	q := r.db.Model(&Product{}).
		Preload("Category").
		Preload("Outlet").
		Preload("Station").
		Preload("Images").
		Preload("Images.Media").
		Preload("OptionGroups").
		Preload("OptionGroups.Values")

	if search != "" {
		q = q.Where("name ILIKE ?", "%"+search+"%")
	}
	if categoryID != nil && *categoryID != uuid.Nil {
		q = q.Where("category_id = ?", *categoryID)
	}
	if outletID != nil && *outletID != uuid.Nil {
		q = q.Where("outlet_id = ?", *outletID)
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

func (r *repository) GetProductByID(id uuid.UUID) (*Product, error) {
	var p Product
	err := r.db.
		Preload("Category").
		Preload("Outlet").
		Preload("Station").
		Preload("Images").
		Preload("Images.Media").
		Preload("OptionGroups").
		Preload("OptionGroups.Values").
		First(&p, id).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *repository) CreateProduct(p *Product, optionGroupIDs []uuid.UUID) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Omit(clause.Associations).Create(p).Error; err != nil {
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

func (r *repository) UpdateProduct(p *Product, optionGroupIDs *[]uuid.UUID) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Omit(clause.Associations).Save(p).Error; err != nil {
			return err
		}
		if optionGroupIDs != nil {
			if err := tx.Where("product_id = ?", p.ID).Delete(&ProductOptionGroup{}).Error; err != nil {
				return err
			}
			for _, ogID := range *optionGroupIDs {
				pog := ProductOptionGroup{ProductID: p.ID, OptionGroupID: ogID}
				if err := tx.Create(&pog).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
}

func (r *repository) DeleteProduct(id uuid.UUID) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("product_id = ?", id).Delete(&ProductOptionGroup{}).Error; err != nil {
			return err
		}
		return tx.Delete(&Product{}, id).Error
	})
}

// ── Option Groups ────────────────────────────────────────────────

func (r *repository) ListOptionGroups(search string, outletID *uuid.UUID, p pagination.Params) ([]OptionGroup, int64, error) {
	var groups []OptionGroup
	var total int64

	q := r.db.Model(&OptionGroup{}).
		Preload("Outlet").
		Preload("Values")

	if search != "" {
		q = q.Where("name ILIKE ?", "%"+search+"%")
	}
	if outletID != nil && *outletID != uuid.Nil {
		q = q.Where("outlet_id = ?", *outletID)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("id asc").Limit(p.Limit).Offset(p.Offset).Find(&groups).Error
	return groups, total, err
}

func (r *repository) GetOptionGroupByID(id uuid.UUID) (*OptionGroup, error) {
	var g OptionGroup
	if err := r.db.Preload("Outlet").Preload("Values").First(&g, id).Error; err != nil {
		return nil, err
	}
	return &g, nil
}

func (r *repository) CreateOptionGroup(g *OptionGroup) error {
	return r.db.Create(g).Error
}

func (r *repository) UpdateOptionGroup(id uuid.UUID, g *OptionGroup) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		updates := map[string]interface{}{
			"outlet_id":   g.OutletID,
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
				v.ID = uuid.New()
				v.OptionGroupID = id
				if v.IsUnlimited == nil {
					defUnl := true
					v.IsUnlimited = &defUnl
				}
				if *v.IsUnlimited {
					v.StockQuantity = 0
				}
				if err := tx.Create(&v).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
}

func (r *repository) DeleteOptionGroup(id uuid.UUID) error {
	return r.db.Delete(&OptionGroup{}, id).Error
}

func (r *repository) CreateOptionValue(v *OptionValue) error {
	return r.db.Create(v).Error
}

func (r *repository) DeleteOptionValue(id uuid.UUID) error {
	return r.db.Delete(&OptionValue{}, id).Error
}
