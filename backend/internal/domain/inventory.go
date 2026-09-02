package domain

import (
	"time"

	"github.com/google/uuid"
)

// Supplier represents a product/ingredient vendor
type Supplier struct {
	ID            uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name          string     `gorm:"size:255;not null" json:"name"`
	ContactPerson *string    `gorm:"size:100" json:"contact_person"`
	Phone         *string    `gorm:"size:50" json:"phone"`
	Email         *string    `gorm:"size:255" json:"email"`
	Address       *string    `json:"address"`
	IsActive      bool       `gorm:"default:true" json:"is_active"`
	CreatedBy     *uuid.UUID `gorm:"type:uuid" json:"created_by"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

// Ingredient represents a raw material used in recipes
type Ingredient struct {
	ID                uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name              string     `gorm:"size:255;not null" json:"name"`
	Unit              string     `gorm:"size:50;not null" json:"unit"`
	StockQuantity     float64    `gorm:"type:numeric(10,3);default:0.000" json:"stock_quantity"`
	LowStockThreshold float64    `gorm:"type:numeric(10,3);default:5.000" json:"low_stock_threshold"`
	CostPerUnit       float64    `gorm:"type:numeric(10,2);default:0.00" json:"cost_per_unit"`
	IsActive          bool       `gorm:"default:true" json:"is_active"`
	CreatedBy         *uuid.UUID `gorm:"type:uuid" json:"created_by"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}

// Recipe maps an ingredient quantity to a product or option value
type Recipe struct {
	ID               uuid.UUID   `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ProductID        *uuid.UUID  `gorm:"type:uuid" json:"product_id"`
	OptionValueID    *uuid.UUID  `gorm:"type:uuid" json:"option_value_id"`
	IngredientID     uuid.UUID   `gorm:"type:uuid;not null" json:"ingredient_id"`
	QuantityRequired float64     `gorm:"type:numeric(10,3);not null" json:"quantity_required"`
	CreatedBy        *uuid.UUID  `gorm:"type:uuid" json:"created_by"`
	CreatedAt        time.Time   `json:"created_at"`
	UpdatedAt        time.Time   `json:"updated_at"`
	Ingredient       *Ingredient `gorm:"foreignKey:IngredientID" json:"ingredient,omitempty"`
}

// PurchaseOrder represents a procurement order from a supplier
type PurchaseOrder struct {
	ID                   uuid.UUID           `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	PONumber             string              `gorm:"uniqueIndex;size:50;not null" json:"po_number"`
	SupplierID           uuid.UUID           `gorm:"type:uuid;not null" json:"supplier_id"`
	Status               string              `gorm:"size:20;default:'draft'" json:"status"` // draft | sent | received | cancelled
	TotalAmount          float64             `gorm:"type:numeric(10,2);default:0.00" json:"total_amount"`
	ExpectedDeliveryDate *time.Time          `json:"expected_delivery_date"`
	ReceivedAt           *time.Time          `json:"received_at"`
	Notes                *string             `json:"notes"`
	CreatedBy            *uuid.UUID          `gorm:"type:uuid" json:"created_by"`
	CreatedAt            time.Time           `json:"created_at"`
	UpdatedAt            time.Time           `json:"updated_at"`
	Supplier             *Supplier           `gorm:"foreignKey:SupplierID" json:"supplier,omitempty"`
	Items                []PurchaseOrderItem `gorm:"foreignKey:PurchaseOrderID" json:"items,omitempty"`
}

// PurchaseOrderItem is a line item in a purchase order
type PurchaseOrderItem struct {
	ID               uuid.UUID   `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	PurchaseOrderID  uuid.UUID   `gorm:"type:uuid;not null" json:"purchase_order_id"`
	IngredientID     *uuid.UUID  `gorm:"type:uuid" json:"ingredient_id"`
	ProductID        *uuid.UUID  `gorm:"type:uuid" json:"product_id"`
	QuantityOrdered  float64     `gorm:"type:numeric(10,3);not null" json:"quantity_ordered"`
	QuantityReceived float64     `gorm:"type:numeric(10,3);default:0.000" json:"quantity_received"`
	UnitCost         float64     `gorm:"type:numeric(10,2);default:0.00" json:"unit_cost"`
	Subtotal         float64     `gorm:"type:numeric(10,2);default:0.00" json:"subtotal"`
	Ingredient       *Ingredient `gorm:"foreignKey:IngredientID" json:"ingredient,omitempty"`
}

// StockWaste records ingredient or product waste
type StockWaste struct {
	ID           uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	IngredientID *uuid.UUID `gorm:"type:uuid" json:"ingredient_id"`
	ProductID    *uuid.UUID `gorm:"type:uuid" json:"product_id"`
	Quantity     float64    `gorm:"type:numeric(10,3);not null" json:"quantity"`
	Reason       string     `gorm:"size:100;not null" json:"reason"`
	CostLoss     float64    `gorm:"type:numeric(10,2);default:0.00" json:"cost_loss"`
	ReportedBy   *uuid.UUID `gorm:"type:uuid" json:"reported_by"`
	CreatedAt    time.Time  `json:"created_at"`
}

// IngredientStockLog records stock in/out movements for ingredients
type IngredientStockLog struct {
	ID              uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	IngredientID    uuid.UUID  `gorm:"type:uuid;not null" json:"ingredient_id"`
	OrderID         *uuid.UUID `gorm:"type:uuid" json:"order_id"`
	PurchaseOrderID *uuid.UUID `gorm:"type:uuid" json:"purchase_order_id"`
	Type            string     `gorm:"size:20;not null" json:"type"` // in | out | adjustment
	Quantity        float64    `gorm:"type:numeric(10,3);not null" json:"quantity"`
	QuantityAfter   float64    `gorm:"type:numeric(10,3);not null" json:"quantity_after"`
	Note            *string    `json:"note"`
	CreatedBy       *uuid.UUID `gorm:"type:uuid" json:"created_by"`
	CreatedAt       time.Time  `json:"created_at"`
}

// ProductStockLog records stock in/out movements for finished products
type ProductStockLog struct {
	ID            uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ProductID     uuid.UUID  `gorm:"type:uuid;not null" json:"product_id"`
	OrderID       *uuid.UUID `gorm:"type:uuid" json:"order_id"`
	Type          string     `gorm:"size:20;not null" json:"type"`
	Quantity      int        `gorm:"not null" json:"quantity"`
	QuantityAfter int        `gorm:"not null" json:"quantity_after"`
	Note          *string    `json:"note"`
	CreatedBy     *uuid.UUID `gorm:"type:uuid" json:"created_by"`
	CreatedAt     time.Time  `json:"created_at"`
}

// SystemSetting is a key-value store for runtime configuration
type SystemSetting struct {
	ID           uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	SettingKey   string     `gorm:"uniqueIndex;size:100;not null" json:"setting_key"`
	SettingValue *string    `json:"setting_value"`
	CreatedBy    *uuid.UUID `gorm:"type:uuid" json:"created_by"`
	UpdatedAt    time.Time  `json:"updated_at"`
}
