package products

import (
	"errors"

	"github.com/pos-system/backend/pkg/pagination"
)

type Service interface {
	// Categories
	ListCategories(search string, p pagination.Params) ([]Category, int64, error)
	GetCategory(id uint64) (*Category, error)
	CreateCategory(req *CreateCategoryRequest, creatorID *uint64) (*Category, error)
	UpdateCategory(id uint64, c *Category) error
	DeleteCategory(id uint64) error

	// Products
	ListProducts(search string, categoryID *uint64, isAvailable *bool, p pagination.Params) ([]Product, int64, error)
	GetProduct(id uint64) (*Product, error)
	CreateProduct(req *CreateProductRequest, creatorID *uint64) (*Product, error)
	UpdateProduct(id uint64, req *UpdateProductRequest) (*Product, error)
	DeleteProduct(id uint64) error

	// Option Groups
	ListOptionGroups(search string, p pagination.Params) ([]OptionGroup, int64, error)
	GetOptionGroup(id uint64) (*OptionGroup, error)
	CreateOptionGroup(req *CreateOptionGroupRequest, creatorID *uint64) (*OptionGroup, error)
	UpdateOptionGroup(id uint64, g *OptionGroup) error
	DeleteOptionGroup(id uint64) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) ListCategories(search string, p pagination.Params) ([]Category, int64, error) {
	return s.repo.ListCategories(search, p)
}

func (s *service) GetCategory(id uint64) (*Category, error) {
	return s.repo.GetCategoryByID(id)
}

func (s *service) CreateCategory(req *CreateCategoryRequest, creatorID *uint64) (*Category, error) {
	isAct := true
	if req.IsActive != nil {
		isAct = *req.IsActive
	}
	c := &Category{
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

func (s *service) UpdateCategory(id uint64, c *Category) error {
	return s.repo.UpdateCategory(id, c)
}

func (s *service) DeleteCategory(id uint64) error {
	return s.repo.DeleteCategory(id)
}

func (s *service) ListProducts(search string, categoryID *uint64, isAvailable *bool, p pagination.Params) ([]Product, int64, error) {
	return s.repo.ListProducts(search, categoryID, isAvailable, p)
}

func (s *service) GetProduct(id uint64) (*Product, error) {
	return s.repo.GetProductByID(id)
}

func (s *service) CreateProduct(req *CreateProductRequest, creatorID *uint64) (*Product, error) {
	isAvail := true
	if req.IsAvailable != nil {
		isAvail = *req.IsAvailable
	}
	p := &Product{
		CategoryID:        req.CategoryID,
		Name:              req.Name,
		Description:       req.Description,
		Price:             req.Price,
		StockQuantity:     req.StockQuantity,
		LowStockThreshold: req.LowStockThreshold,
		TrackStock:        req.TrackStock,
		ImageURL:          req.ImageURL,
		IsAvailable:       isAvail,
		CreatedBy:         creatorID,
	}
	if err := s.repo.CreateProduct(p, req.OptionGroupIDs); err != nil {
		return nil, err
	}
	return s.repo.GetProductByID(p.ID)
}

func (s *service) UpdateProduct(id uint64, req *UpdateProductRequest) (*Product, error) {
	p, err := s.repo.GetProductByID(id)
	if err != nil {
		return nil, errors.New("product not found")
	}

	if req.CategoryID != nil {
		p.CategoryID = *req.CategoryID
	}
	if req.Name != nil {
		p.Name = *req.Name
	}
	if req.Description != nil {
		p.Description = req.Description
	}
	if req.Price != nil {
		p.Price = *req.Price
	}
	if req.StockQuantity != nil {
		p.StockQuantity = *req.StockQuantity
	}
	if req.LowStockThreshold != nil {
		p.LowStockThreshold = *req.LowStockThreshold
	}
	if req.TrackStock != nil {
		p.TrackStock = *req.TrackStock
	}
	if req.ImageURL != nil {
		p.ImageURL = req.ImageURL
	}
	if req.IsAvailable != nil {
		p.IsAvailable = *req.IsAvailable
	}

	if err := s.repo.UpdateProduct(p, req.OptionGroupIDs); err != nil {
		return nil, err
	}
	return s.repo.GetProductByID(id)
}

func (s *service) DeleteProduct(id uint64) error {
	return s.repo.DeleteProduct(id)
}

func (s *service) ListOptionGroups(search string, p pagination.Params) ([]OptionGroup, int64, error) {
	return s.repo.ListOptionGroups(search, p)
}

func (s *service) GetOptionGroup(id uint64) (*OptionGroup, error) {
	return s.repo.GetOptionGroupByID(id)
}

func (s *service) CreateOptionGroup(req *CreateOptionGroupRequest, creatorID *uint64) (*OptionGroup, error) {
	g := &OptionGroup{
		Name:       req.Name,
		Type:       req.Type,
		IsRequired: req.IsRequired,
		CreatedBy:  creatorID,
	}
	if g.Type == "" {
		g.Type = "single"
	}
	if err := s.repo.CreateOptionGroup(g); err != nil {
		return nil, err
	}
	for _, v := range req.Values {
		val := OptionValue{
			OptionGroupID: g.ID,
			Name:          v.Name,
			Price:         v.Price,
			CreatedBy:     creatorID,
		}
		_ = s.repo.CreateOptionValue(&val)
	}
	return s.repo.GetOptionGroupByID(g.ID)
}

func (s *service) UpdateOptionGroup(id uint64, g *OptionGroup) error {
	return s.repo.UpdateOptionGroup(id, g)
}

func (s *service) DeleteOptionGroup(id uint64) error {
	return s.repo.DeleteOptionGroup(id)
}
