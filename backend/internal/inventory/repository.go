package inventory

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/pos-system/backend/pkg/pagination"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

// ── Suppliers CRUD ───────────────────────────────────────────────

func (r *Repository) ListSuppliers(search string, p pagination.Params) ([]Supplier, int64, error) {
	var list []Supplier
	var total int64

	q := r.db.Model(&Supplier{})
	if search != "" {
		s := "%" + search + "%"
		q = q.Where("name ILIKE ? OR contact_person ILIKE ? OR email ILIKE ?", s, s, s)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("id DESC").Limit(p.Limit).Offset(p.Offset).Find(&list).Error
	return list, total, err
}

func (r *Repository) GetSupplierByID(id uuid.UUID) (*Supplier, error) {
	var s Supplier
	if err := r.db.First(&s, id).Error; err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *Repository) CreateSupplier(s *Supplier) error {
	return r.db.Create(s).Error
}

func (r *Repository) UpdateSupplier(id uuid.UUID, s *Supplier) error {
	return r.db.Model(&Supplier{}).Where("id = ?", id).Updates(s).Error
}

func (r *Repository) DeleteSupplier(id uuid.UUID) error {
	return r.db.Delete(&Supplier{}, id).Error
}

// ── Ingredients CRUD ─────────────────────────────────────────────

func (r *Repository) ListIngredients(search string, lowStock bool, p pagination.Params) ([]Ingredient, int64, error) {
	var list []Ingredient
	var total int64

	q := r.db.Model(&Ingredient{})
	if search != "" {
		q = q.Where("name ILIKE ?", "%"+search+"%")
	}
	if lowStock {
		q = q.Where("stock_quantity <= low_stock_threshold")
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("id DESC").Limit(p.Limit).Offset(p.Offset).Find(&list).Error
	return list, total, err
}

func (r *Repository) GetIngredientByID(id uuid.UUID) (*Ingredient, error) {
	var ing Ingredient
	if err := r.db.First(&ing, id).Error; err != nil {
		return nil, err
	}
	return &ing, nil
}

func (r *Repository) CreateIngredient(ing *Ingredient) error {
	return r.db.Create(ing).Error
}

func (r *Repository) UpdateIngredient(id uuid.UUID, ing *Ingredient) error {
	return r.db.Model(&Ingredient{}).Where("id = ?", id).Updates(ing).Error
}

func (r *Repository) DeleteIngredient(id uuid.UUID) error {
	return r.db.Delete(&Ingredient{}, id).Error
}

// ── Recipes CRUD ─────────────────────────────────────────────────

func (r *Repository) ListRecipes(productID *uuid.UUID, p pagination.Params) ([]Recipe, int64, error) {
	var list []Recipe
	var total int64

	q := r.db.Model(&Recipe{}).Preload("Ingredient")
	if productID != nil && *productID != uuid.Nil {
		q = q.Where("product_id = ?", *productID)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("id DESC").Limit(p.Limit).Offset(p.Offset).Find(&list).Error
	return list, total, err
}

func (r *Repository) GetRecipeByID(id uuid.UUID) (*Recipe, error) {
	var rec Recipe
	if err := r.db.Preload("Ingredient").First(&rec, id).Error; err != nil {
		return nil, err
	}
	return &rec, nil
}

func (r *Repository) CreateRecipe(rec *Recipe) error {
	return r.db.Create(rec).Error
}

func (r *Repository) UpdateRecipe(id uuid.UUID, rec *Recipe) error {
	return r.db.Model(&Recipe{}).Where("id = ?", id).Updates(rec).Error
}

func (r *Repository) DeleteRecipe(id uuid.UUID) error {
	return r.db.Delete(&Recipe{}, id).Error
}

// ── Purchase Orders CRUD ─────────────────────────────────────────

func (r *Repository) ListPurchaseOrders(supplierID *uuid.UUID, status string, p pagination.Params) ([]PurchaseOrder, int64, error) {
	var list []PurchaseOrder
	var total int64

	q := r.db.Model(&PurchaseOrder{}).Preload("Supplier").Preload("Items.Ingredient")
	if supplierID != nil && *supplierID != uuid.Nil {
		q = q.Where("supplier_id = ?", *supplierID)
	}
	if status != "" {
		q = q.Where("status = ?", status)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("id DESC").Limit(p.Limit).Offset(p.Offset).Find(&list).Error
	return list, total, err
}

func (r *Repository) GetPurchaseOrderByID(id uuid.UUID) (*PurchaseOrder, error) {
	var po PurchaseOrder
	if err := r.db.Preload("Supplier").Preload("Items.Ingredient").First(&po, id).Error; err != nil {
		return nil, err
	}
	return &po, nil
}

func (r *Repository) CreatePurchaseOrder(po *PurchaseOrder) error {
	if po.PONumber == "" {
		po.PONumber = fmt.Sprintf("PO-%d", time.Now().UnixNano()/1e6)
	}
	return r.db.Create(po).Error
}

func (r *Repository) UpdatePurchaseOrderStatus(id uuid.UUID, status string) error {
	updates := map[string]interface{}{"status": status, "updated_at": time.Now()}
	if status == "received" {
		now := time.Now()
		updates["received_at"] = &now
	}
	return r.db.Model(&PurchaseOrder{}).Where("id = ?", id).Updates(updates).Error
}

func (r *Repository) DeletePurchaseOrder(id uuid.UUID) error {
	return r.db.Delete(&PurchaseOrder{}, id).Error
}

// ── Stock Logs & Movements ───────────────────────────────────────

func (r *Repository) ListIngredientStockLogs(ingredientID *uuid.UUID, p pagination.Params) ([]IngredientStockLog, int64, error) {
	var list []IngredientStockLog
	var total int64

	q := r.db.Model(&IngredientStockLog{}).Preload("Ingredient")
	if ingredientID != nil && *ingredientID != uuid.Nil {
		q = q.Where("ingredient_id = ?", *ingredientID)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("id DESC").Limit(p.Limit).Offset(p.Offset).Find(&list).Error
	return list, total, err
}

func (r *Repository) CreateIngredientStockLog(log *IngredientStockLog) error {
	return r.db.Create(log).Error
}

func (r *Repository) ListProductStockLogs(productID *uuid.UUID, p pagination.Params) ([]ProductStockLog, int64, error) {
	var list []ProductStockLog
	var total int64

	q := r.db.Model(&ProductStockLog{})
	if productID != nil && *productID != uuid.Nil {
		q = q.Where("product_id = ?", *productID)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("id DESC").Limit(p.Limit).Offset(p.Offset).Find(&list).Error
	return list, total, err
}

func (r *Repository) CreateProductStockLog(log *ProductStockLog) error {
	return r.db.Create(log).Error
}

func (r *Repository) ListStockWastes(p pagination.Params) ([]StockWaste, int64, error) {
	var list []StockWaste
	var total int64

	q := r.db.Model(&StockWaste{}).Preload("Ingredient")
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("id DESC").Limit(p.Limit).Offset(p.Offset).Find(&list).Error
	return list, total, err
}

func (r *Repository) CreateStockWaste(waste *StockWaste) error {
	return r.db.Create(waste).Error
}
