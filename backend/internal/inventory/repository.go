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
		q = q.Where("name ILIKE ? OR contact_person ILIKE ? OR phone ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
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

func (r *Repository) ListIngredients(search string, lowStock bool, categoryID *uuid.UUID, p pagination.Params) ([]Ingredient, int64, error) {
	var list []Ingredient
	var total int64

	q := r.db.Model(&Ingredient{}).Preload("Category")
	if search != "" {
		q = q.Where("name ILIKE ?", "%"+search+"%")
	}
	if lowStock {
		q = q.Where("stock_quantity <= low_stock_threshold")
	}
	if categoryID != nil && *categoryID != uuid.Nil {
		q = q.Where("category_id = ?", *categoryID)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("created_at DESC, id DESC").Limit(p.Limit).Offset(p.Offset).Find(&list).Error
	return list, total, err
}

func (r *Repository) GetIngredientByID(id uuid.UUID) (*Ingredient, error) {
	var ing Ingredient
	if err := r.db.Preload("Category").First(&ing, id).Error; err != nil {
		return nil, err
	}
	return &ing, nil
}

func (r *Repository) CreateIngredient(ing *Ingredient) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(ing).Error; err != nil {
			return err
		}
		if ing.StockQuantity > 0 {
			note := fmt.Sprintf("Initial stock balance recorded: %.3f %s", ing.StockQuantity, ing.Unit)
			log := &IngredientStockLog{
				IngredientID:  ing.ID,
				Type:          "adjustment",
				Quantity:      ing.StockQuantity,
				QuantityAfter: ing.StockQuantity,
				Note:          &note,
				CreatedAt:     time.Now(),
			}
			return tx.Create(log).Error
		}
		return nil
	})
}

func (r *Repository) UpdateIngredient(id uuid.UUID, ing *Ingredient) error {
	var oldIng Ingredient
	if err := r.db.First(&oldIng, id).Error; err != nil {
		return err
	}

	return r.db.Transaction(func(tx *gorm.DB) error {
		updates := map[string]interface{}{
			"category_id":         ing.CategoryID,
			"name":                ing.Name,
			"unit":                ing.Unit,
			"stock_quantity":      ing.StockQuantity,
			"low_stock_threshold": ing.LowStockThreshold,
			"cost_per_unit":       ing.CostPerUnit,
			"image_url":           ing.ImageURL,
			"is_active":           ing.IsActive,
			"updated_at":          time.Now(),
		}
		if err := tx.Model(&Ingredient{}).Where("id = ?", id).Updates(updates).Error; err != nil {
			return err
		}

		delta := ing.StockQuantity - oldIng.StockQuantity
		if delta != 0 {
			note := fmt.Sprintf("Manual stock adjustment: %.3f -> %.3f %s", oldIng.StockQuantity, ing.StockQuantity, oldIng.Unit)
			log := &IngredientStockLog{
				IngredientID:  id,
				Type:          "adjustment",
				Quantity:      delta,
				QuantityAfter: ing.StockQuantity,
				Note:          &note,
				CreatedAt:     time.Now(),
			}
			return tx.Create(log).Error
		}
		return nil
	})
}

func (r *Repository) DeleteIngredient(id uuid.UUID) error {
	return r.db.Delete(&Ingredient{}, id).Error
}

// ── Ingredient Categories CRUD ───────────────────────────────────

func (r *Repository) ListIngredientCategories(search string) ([]IngredientCategory, error) {
	var list []IngredientCategory
	q := r.db.Model(&IngredientCategory{})
	if search != "" {
		q = q.Where("name ILIKE ? OR code ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	err := q.Order("sort_order ASC, name ASC").Find(&list).Error
	return list, err
}

func (r *Repository) GetIngredientCategoryByID(id uuid.UUID) (*IngredientCategory, error) {
	var cat IngredientCategory
	if err := r.db.First(&cat, id).Error; err != nil {
		return nil, err
	}
	return &cat, nil
}

func (r *Repository) CreateIngredientCategory(cat *IngredientCategory) error {
	return r.db.Create(cat).Error
}

func (r *Repository) UpdateIngredientCategory(id uuid.UUID, cat *IngredientCategory) error {
	return r.db.Model(&IngredientCategory{}).Where("id = ?", id).Updates(map[string]interface{}{
		"name":        cat.Name,
		"code":        cat.Code,
		"description": cat.Description,
		"sort_order":  cat.SortOrder,
		"is_active":   cat.IsActive,
		"updated_at":  time.Now(),
	}).Error
}

func (r *Repository) DeleteIngredientCategory(id uuid.UUID) error {
	return r.db.Delete(&IngredientCategory{}, id).Error
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
	var recipe Recipe
	if err := r.db.Preload("Ingredient").First(&recipe, id).Error; err != nil {
		return nil, err
	}
	return &recipe, nil
}

func (r *Repository) CreateRecipe(recipe *Recipe) error {
	return r.db.Create(recipe).Error
}

func (r *Repository) UpdateRecipe(id uuid.UUID, recipe *Recipe) error {
	return r.db.Model(&Recipe{}).Where("id = ?", id).Updates(recipe).Error
}

func (r *Repository) DeleteRecipe(id uuid.UUID) error {
	return r.db.Delete(&Recipe{}, id).Error
}

// ── Purchase Orders & Weighted Average Cost (WAC) ─────────────────

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
	var po PurchaseOrder
	if err := r.db.Preload("Items").First(&po, id).Error; err != nil {
		return err
	}

	return r.db.Transaction(func(tx *gorm.DB) error {
		// If marking as received and it wasn't received yet -> recalculate WAC & restock
		if status == "received" && po.Status != "received" {
			now := time.Now()
			for _, item := range po.Items {
				if item.IngredientID != nil && *item.IngredientID != uuid.Nil {
					var ing Ingredient
					if err := tx.First(&ing, *item.IngredientID).Error; err != nil {
						continue
					}

					oldStock := ing.StockQuantity
					oldCost := ing.CostPerUnit
					orderedQty := item.QuantityOrdered
					unitCost := item.UnitCost

					newStock := oldStock + orderedQty
					var newCost float64

					// Weighted Average Cost (WAC) Formula:
					// New Cost = (Old Stock * Old Cost + Inbound Qty * Inbound Cost) / Total Combined Stock
					if oldStock <= 0 {
						newCost = unitCost
					} else if newStock > 0 {
						newCost = ((oldStock * oldCost) + (orderedQty * unitCost)) / newStock
					} else {
						newCost = unitCost
					}

					if err := tx.Model(&Ingredient{}).Where("id = ?", ing.ID).Updates(map[string]interface{}{
						"stock_quantity": newStock,
						"cost_per_unit":  newCost,
						"updated_at":     now,
					}).Error; err != nil {
						return err
					}

					// Update Line item received quantity
					tx.Model(&PurchaseOrderItem{}).Where("id = ?", item.ID).Update("quantity_received", orderedQty)

					// Log movement in stock audit trail
					note := fmt.Sprintf("PO #%s received: +%.3f %s (WAC Cost: $%.2f -> $%.2f)", po.PONumber, orderedQty, ing.Unit, oldCost, newCost)
					log := &IngredientStockLog{
						IngredientID:    *item.IngredientID,
						PurchaseOrderID: &po.ID,
						Type:            "po_receive",
						Quantity:        orderedQty,
						QuantityAfter:   newStock,
						Note:            &note,
						CreatedAt:       now,
					}
					if err := tx.Create(log).Error; err != nil {
						return err
					}
				}
			}

			return tx.Model(&PurchaseOrder{}).Where("id = ?", id).Updates(map[string]interface{}{
				"status":      "received",
				"received_at": &now,
				"updated_at":  now,
			}).Error
		}

		// Standard status update (e.g. draft -> ordered, canceled)
		updates := map[string]interface{}{"status": status, "updated_at": time.Now()}
		return tx.Model(&PurchaseOrder{}).Where("id = ?", id).Updates(updates).Error
	})
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
	return r.db.Transaction(func(tx *gorm.DB) error {
		var ing Ingredient
		if err := tx.First(&ing, waste.IngredientID).Error; err != nil {
			return err
		}

		if waste.CostLoss <= 0 {
			waste.CostLoss = waste.Quantity * ing.CostPerUnit
		}

		if err := tx.Create(waste).Error; err != nil {
			return err
		}

		newStock := ing.StockQuantity - waste.Quantity
		if newStock < 0 {
			newStock = 0
		}

		now := time.Now()
		if err := tx.Model(&Ingredient{}).Where("id = ?", ing.ID).Updates(map[string]interface{}{
			"stock_quantity": newStock,
			"updated_at":     now,
		}).Error; err != nil {
			return err
		}

		note := fmt.Sprintf("Wastage/Spoilage: -%.3f %s (Reason: %s, Financial Loss: $%.2f)", waste.Quantity, ing.Unit, waste.Reason, waste.CostLoss)
		log := &IngredientStockLog{
			IngredientID:  ing.ID,
			Type:          "waste",
			Quantity:      -waste.Quantity,
			QuantityAfter: newStock,
			Note:          &note,
			CreatedAt:     now,
		}
		return tx.Create(log).Error
	})
}
