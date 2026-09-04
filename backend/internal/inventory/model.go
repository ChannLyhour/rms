package inventory

import (
	"time"

	"github.com/google/uuid"
)

// Supplier represents an ingredient/goods vendor
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

func (Supplier) TableName() string {
	return "suppliers"
}

// IngredientCategory represents a master classification for raw materials
type IngredientCategory struct {
	ID          uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name        string         `gorm:"size:100;not null" json:"name"`
	Code        string         `gorm:"size:50;not null;unique" json:"code"`
	Description *string        `gorm:"type:text" json:"description"`
	SortOrder   int            `gorm:"default:0" json:"sort_order"`
	IsActive    bool           `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	Ingredients []Ingredient   `gorm:"foreignKey:CategoryID" json:"ingredients,omitempty"`
}

func (IngredientCategory) TableName() string {
	return "ingredient_categories"
}

// Ingredient represents raw kitchen stock
type Ingredient struct {
	ID                uuid.UUID           `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	CategoryID        *uuid.UUID          `gorm:"type:uuid" json:"category_id"`
	Name              string              `gorm:"size:255;not null" json:"name"`
	Unit              string              `gorm:"size:50;not null" json:"unit"` // kg | g | l | ml | pcs
	StockQuantity     float64             `gorm:"type:numeric(10,3);default:0.000" json:"stock_quantity"`
	LowStockThreshold float64             `gorm:"type:numeric(10,3);default:5.000" json:"low_stock_threshold"`
	CostPerUnit       float64             `gorm:"type:numeric(10,2);default:0.00" json:"cost_per_unit"`
	ImageURL          *string             `gorm:"type:text" json:"image_url"`
	IsActive          bool                `gorm:"default:true" json:"is_active"`
	CreatedBy         *uuid.UUID          `gorm:"type:uuid" json:"created_by"`
	CreatedAt         time.Time           `json:"created_at"`
	UpdatedAt         time.Time           `json:"updated_at"`
	Category          *IngredientCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}

func (Ingredient) TableName() string {
	return "ingredients"
}

// Recipe maps products/options to raw ingredients
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

func (Recipe) TableName() string {
	return "recipes"
}

// PurchaseOrder represents purchase request to a supplier
type PurchaseOrder struct {
	ID                   uuid.UUID           `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	PONumber             string              `gorm:"size:50;not null;unique" json:"po_number"`
	SupplierID           uuid.UUID           `gorm:"type:uuid;not null" json:"supplier_id"`
	Status               string              `gorm:"size:20;not null;default:'draft'" json:"status"` // draft | ordered | received | canceled
	TotalAmount          float64             `gorm:"type:numeric(10,2);default:0.00" json:"total_amount"`
	ExpectedDeliveryDate *string             `json:"expected_delivery_date"`
	ReceivedAt           *time.Time          `json:"received_at"`
	Notes                *string             `json:"notes"`
	CreatedBy            *uuid.UUID          `gorm:"type:uuid" json:"created_by"`
	CreatedAt            time.Time           `json:"created_at"`
	UpdatedAt            time.Time           `json:"updated_at"`
	Supplier             *Supplier           `gorm:"foreignKey:SupplierID" json:"supplier,omitempty"`
	Items                []PurchaseOrderItem `gorm:"foreignKey:PurchaseOrderID" json:"items,omitempty"`
}

func (PurchaseOrder) TableName() string {
	return "purchase_orders"
}

// PurchaseOrderItem represents line item inside a PO
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

func (PurchaseOrderItem) TableName() string {
	return "purchase_order_items"
}

// ProductStockLog records adjustments in product stock
type ProductStockLog struct {
	ID            uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ProductID     uuid.UUID  `gorm:"type:uuid;not null" json:"product_id"`
	OrderID       *uuid.UUID `gorm:"type:uuid" json:"order_id"`
	Type          string     `gorm:"size:20;not null" json:"type"` // order_deduct | restock | adjustment | waste
	Quantity      int        `gorm:"not null" json:"quantity"`
	QuantityAfter int        `gorm:"not null" json:"quantity_after"`
	Note          *string    `json:"note"`
	CreatedBy     *uuid.UUID `gorm:"type:uuid" json:"created_by"`
	CreatedAt     time.Time  `json:"created_at"`
}

func (ProductStockLog) TableName() string {
	return "product_stock_logs"
}

// IngredientStockLog records movements in kitchen ingredient stock
type IngredientStockLog struct {
	ID              uuid.UUID   `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	IngredientID    uuid.UUID   `gorm:"type:uuid;not null" json:"ingredient_id"`
	OrderID         *uuid.UUID  `gorm:"type:uuid" json:"order_id"`
	PurchaseOrderID *uuid.UUID  `gorm:"type:uuid" json:"purchase_order_id"`
	Type            string      `gorm:"size:20;not null" json:"type"` // order_deduct | po_receive | adjustment | waste
	Quantity        float64     `gorm:"type:numeric(10,3);not null" json:"quantity"`
	QuantityAfter   float64     `gorm:"type:numeric(10,3);not null" json:"quantity_after"`
	Note            *string     `json:"note"`
	CreatedBy       *uuid.UUID  `gorm:"type:uuid" json:"created_by"`
	CreatedAt       time.Time   `json:"created_at"`
	Ingredient      *Ingredient `gorm:"foreignKey:IngredientID" json:"ingredient,omitempty"`
}

func (IngredientStockLog) TableName() string {
	return "ingredient_stock_logs"
}

// StockWaste records wasted/damaged goods
type StockWaste struct {
	ID           uuid.UUID   `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	IngredientID *uuid.UUID  `gorm:"type:uuid" json:"ingredient_id"`
	ProductID    *uuid.UUID  `gorm:"type:uuid" json:"product_id"`
	Quantity     float64     `gorm:"type:numeric(10,3);not null" json:"quantity"`
	Reason       string      `gorm:"size:100;not null" json:"reason"` // spoiled | expired | damaged | mistake
	CostLoss     float64     `gorm:"type:numeric(10,2);default:0.00" json:"cost_loss"`
	ReportedBy   *uuid.UUID  `gorm:"type:uuid" json:"reported_by"`
	CreatedAt    time.Time   `json:"created_at"`
	Ingredient   *Ingredient `gorm:"foreignKey:IngredientID" json:"ingredient,omitempty"`
}

func (StockWaste) TableName() string {
	return "stock_wastes"
}
