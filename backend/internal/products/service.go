package products

import (
	"errors"

	"github.com/google/uuid"
	"github.com/pos-system/backend/pkg/pagination"
)

type Service interface {
	// Categories
	ListCategories(search string, outletID *uuid.UUID, p pagination.Params) ([]Category, int64, error)
	GetCategory(id uuid.UUID) (*Category, error)
	CreateCategory(req *CreateCategoryRequest, creatorID *uuid.UUID) (*Category, error)
	UpdateCategory(id uuid.UUID, c *Category) error
	DeleteCategory(id uuid.UUID) error

	// Products
	ListProducts(search string, categoryID *uuid.UUID, outletID *uuid.UUID, isAvailable *bool, p pagination.Params) ([]Product, int64, error)
	GetProduct(id uuid.UUID) (*Product, error)
	CreateProduct(req *CreateProductRequest, creatorID *uuid.UUID) (*Product, error)
	UpdateProduct(id uuid.UUID, req *UpdateProductRequest) (*Product, error)
	DeleteProduct(id uuid.UUID) error

	// Option Groups
	ListOptionGroups(search string, outletID *uuid.UUID, p pagination.Params) ([]OptionGroup, int64, error)
	GetOptionGroup(id uuid.UUID) (*OptionGroup, error)
	CreateOptionGroup(req *CreateOptionGroupRequest, creatorID *uuid.UUID) (*OptionGroup, error)
	UpdateOptionGroup(id uuid.UUID, g *OptionGroup) error
	DeleteOptionGroup(id uuid.UUID) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) ListCategories(search string, outletID *uuid.UUID, p pagination.Params) ([]Category, int64, error) {
	return s.repo.ListCategories(search, outletID, p)
}

func (s *service) GetCategory(id uuid.UUID) (*Category, error) {
	return s.repo.GetCategoryByID(id)
}

func (s *service) CreateCategory(req *CreateCategoryRequest, creatorID *uuid.UUID) (*Category, error) {
	isAct := true
	if req.IsActive != nil {
		isAct = *req.IsActive
	}
	c := &Category{
		OutletID:    req.OutletID,
		ParentID:    req.ParentID,
		Name:        req.Name,
		Description: req.Description,
		ImageURL:    req.ImageURL,
		SortOrder:   req.SortOrder,
		IsActive:    isAct,
		CreatedBy:   creatorID,
	}
	if err := s.repo.CreateCategory(c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *service) UpdateCategory(id uuid.UUID, c *Category) error {
	return s.repo.UpdateCategory(id, c)
}

func (s *service) DeleteCategory(id uuid.UUID) error {
	return s.repo.DeleteCategory(id)
}

func (s *service) ListProducts(search string, categoryID *uuid.UUID, outletID *uuid.UUID, isAvailable *bool, p pagination.Params) ([]Product, int64, error) {
	return s.repo.ListProducts(search, categoryID, outletID, isAvailable, p)
}

func (s *service) GetProduct(id uuid.UUID) (*Product, error) {
	return s.repo.GetProductByID(id)
}

func (s *service) CreateProduct(req *CreateProductRequest, creatorID *uuid.UUID) (*Product, error) {
	isAvail := true
	if req.IsAvailable != nil {
		isAvail = *req.IsAvailable
	}
	isFeat := false
	if req.IsFeatured != nil {
		isFeat = *req.IsFeatured
	}
	discType := "percentage"
	if req.DiscountType != nil && *req.DiscountType != "" {
		discType = *req.DiscountType
	}
	kitchenStation := "Kitchen"
	if req.KitchenStation != nil && *req.KitchenStation != "" {
		kitchenStation = *req.KitchenStation
	}
	prepTime := 15
	if req.PrepTimeMins != nil && *req.PrepTimeMins > 0 {
		prepTime = *req.PrepTimeMins
	}

	p := &Product{
		OutletID:          req.OutletID,
		StationID:         req.StationID,
		CategoryID:        req.CategoryID,
		Name:              req.Name,
		Barcode:           req.Barcode,
		Description:       req.Description,
		Price:             req.Price,
		CostPrice:         req.CostPrice,
		DiscountType:      discType,
		DiscountValue:     req.DiscountValue,
		DiscountPct:       req.DiscountPct,
		StockQuantity:     req.StockQuantity,
		LowStockThreshold: req.LowStockThreshold,
		TrackStock: func() bool {
			if req.IsUnlimited != nil {
				return !*req.IsUnlimited
			}
			return req.TrackStock
		}(),
		IsUnlimited: func() bool {
			if req.IsUnlimited != nil {
				return *req.IsUnlimited
			}
			return !req.TrackStock
		}(),
		ImageProductsID: req.ImageProductsID,
		ImageURL:        req.ImageURL,
		IsAvailable:     isAvail,
		IsFeatured:      isFeat,
		KitchenStation:  kitchenStation,
		PrepTimeMins:    prepTime,
		CreatedBy:       creatorID,
	}
	if err := s.repo.CreateProduct(p, req.OptionGroupIDs); err != nil {
		return nil, err
	}
	return s.repo.GetProductByID(p.ID)
}

func (s *service) UpdateProduct(id uuid.UUID, req *UpdateProductRequest) (*Product, error) {
	p, err := s.repo.GetProductByID(id)
	if err != nil {
		return nil, errors.New("product not found")
	}

	if req.OutletID != nil {
		p.OutletID = req.OutletID
		p.Outlet = nil
	}
	if req.StationID != nil {
		p.StationID = req.StationID
		p.Station = nil
	}
	if req.CategoryID != nil {
		p.CategoryID = *req.CategoryID
		p.Category = nil
	}
	if req.Name != nil {
		p.Name = *req.Name
	}
	if req.Barcode != nil {
		p.Barcode = req.Barcode
	}
	if req.Description != nil {
		p.Description = req.Description
	}
	if req.Price != nil {
		p.Price = *req.Price
	}
	if req.CostPrice != nil {
		p.CostPrice = *req.CostPrice
	}
	if req.DiscountType != nil {
		p.DiscountType = *req.DiscountType
	}
	if req.DiscountValue != nil {
		p.DiscountValue = *req.DiscountValue
	}
	if req.DiscountPct != nil {
		p.DiscountPct = *req.DiscountPct
	}
	if req.StockQuantity != nil {
		p.StockQuantity = *req.StockQuantity
	}
	if req.LowStockThreshold != nil {
		p.LowStockThreshold = *req.LowStockThreshold
	}
	if req.IsUnlimited != nil {
		p.IsUnlimited = *req.IsUnlimited
		p.TrackStock = !(*req.IsUnlimited)
	} else if req.TrackStock != nil {
		p.TrackStock = *req.TrackStock
		p.IsUnlimited = !(*req.TrackStock)
	}
	if req.ImageProductsID != nil {
		p.ImageProductsID = req.ImageProductsID
	}
	if req.ImageURL != nil {
		p.ImageURL = req.ImageURL
	}
	if req.IsAvailable != nil {
		p.IsAvailable = *req.IsAvailable
	}
	if req.IsFeatured != nil {
		p.IsFeatured = *req.IsFeatured
	}
	if req.KitchenStation != nil {
		p.KitchenStation = *req.KitchenStation
	}
	if req.PrepTimeMins != nil {
		p.PrepTimeMins = *req.PrepTimeMins
	}

	if err := s.repo.UpdateProduct(p, req.OptionGroupIDs); err != nil {
		return nil, err
	}
	return s.repo.GetProductByID(id)
}

func (s *service) DeleteProduct(id uuid.UUID) error {
	return s.repo.DeleteProduct(id)
}

func (s *service) ListOptionGroups(search string, outletID *uuid.UUID, p pagination.Params) ([]OptionGroup, int64, error) {
	return s.repo.ListOptionGroups(search, outletID, p)
}

func (s *service) GetOptionGroup(id uuid.UUID) (*OptionGroup, error) {
	return s.repo.GetOptionGroupByID(id)
}

func (s *service) CreateOptionGroup(req *CreateOptionGroupRequest, creatorID *uuid.UUID) (*OptionGroup, error) {
	vals := make([]OptionValue, len(req.Values))
	for i, v := range req.Values {
		isUnlimited := true
		if v.IsUnlimited != nil {
			isUnlimited = *v.IsUnlimited
		}
		stockQty := v.StockQuantity
		if isUnlimited {
			stockQty = 0
		}
		vals[i] = OptionValue{
			Name:          v.Name,
			Price:         v.Price,
			StockQuantity: stockQty,
			IsUnlimited:   &isUnlimited,
			CreatedBy:     creatorID,
		}
	}
	g := &OptionGroup{
		OutletID:   req.OutletID,
		Name:       req.Name,
		Type:       req.Type,
		IsRequired: req.IsRequired,
		Values:     vals,
		CreatedBy:  creatorID,
	}
	if err := s.repo.CreateOptionGroup(g); err != nil {
		return nil, err
	}
	return s.repo.GetOptionGroupByID(g.ID)
}

func (s *service) UpdateOptionGroup(id uuid.UUID, g *OptionGroup) error {
	return s.repo.UpdateOptionGroup(id, g)
}

func (s *service) DeleteOptionGroup(id uuid.UUID) error {
	return s.repo.DeleteOptionGroup(id)
}
