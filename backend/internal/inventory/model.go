package inventory

import (
	"time"
)

// Supplier represents an ingredient/goods vendor
type Supplier struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name          string    `gorm:"size:255;not null" json:"name"`
	ContactPerson *string   `gorm:"size:100" json:"contact_person"`
	Phone         *string   `gorm:"size:50" json:"phone"`
	Email         *string   `gorm:"size:255" json:"email"`
	Address       *string   `json:"address"`
	IsActive      bool      `gorm:"default:true" json:"is_active"`
	CreatedBy     *uint64   `json:"created_by"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (Supplier) TableName() string {
	return "suppliers"
}

// Ingredient represents raw kitchen stock
type Ingredient struct {
	ID                uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name              string    `gorm:"size:255;not null" json:"name"`
	Unit              string    `gorm:"size:50;not null" json:"unit"` // kg | g | l | ml | pcs
	StockQuantity     float64   `gorm:"type:numeric(10,3);default:0.000" json:"stock_quantity"`
	LowStockThreshold float64   `gorm:"type:numeric(10,3);default:5.000" json:"low_stock_threshold"`
	CostPerUnit       float64   `gorm:"type:numeric(10,2);default:0.00" json:"cost_per_unit"`
	IsActive          bool      `gorm:"default:true" json:"is_active"`
	CreatedBy         *uint64   `json:"created_by"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

func (Ingredient) TableName() string {
	return "ingredients"
}

// Recipe maps products/options to raw ingredients
type Recipe struct {
	ID               uint64      `gorm:"primaryKey;autoIncrement" json:"id"`
	ProductID        *uint64     `json:"product_id"`
	OptionValueID    *uint64     `json:"option_value_id"`
	IngredientID     uint64      `gorm:"not null" json:"ingredient_id"`
	QuantityRequired float64     `gorm:"type:numeric(10,3);not null" json:"quantity_required"`
	CreatedBy        *uint64     `json:"created_by"`
	CreatedAt        time.Time   `json:"created_at"`
	UpdatedAt        time.Time   `json:"updated_at"`
	Ingredient       *Ingredient `gorm:"foreignKey:IngredientID" json:"ingredient,omitempty"`
}

func (Recipe) TableName() string {
	return "recipes"
}

// PurchaseOrder represents purchase request to a supplier
type PurchaseOrder struct {
	ID                   uint64              `gorm:"primaryKey;autoIncrement" json:"id"`
	PONumber             string              `gorm:"size:50;not null;unique" json:"po_number"`
	SupplierID           uint64              `gorm:"not null" json:"supplier_id"`
	Status               string              `gorm:"size:20;not null;default:'draft'" json:"status"` // draft | ordered | received | canceled
	TotalAmount          float64             `gorm:"type:numeric(10,2);default:0.00" json:"total_amount"`
	ExpectedDeliveryDate *string             `json:"expected_delivery_date"`
	ReceivedAt           *time.Time          `json:"received_at"`
	Notes                *string             `json:"notes"`
	CreatedBy            *uint64             `json:"created_by"`
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
	ID               uint64      `gorm:"primaryKey;autoIncrement" json:"id"`
	PurchaseOrderID  uint64      `gorm:"not null" json:"purchase_order_id"`
	IngredientID     *uint64     `json:"ingredient_id"`
	ProductID        *uint64     `json:"product_id"`
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
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	ProductID     uint64    `gorm:"not null" json:"product_id"`
	OrderID       *uint64   `json:"order_id"`
	Type          string    `gorm:"size:20;not null" json:"type"` // order_deduct | restock | adjustment | waste
	Quantity      int       `gorm:"not null" json:"quantity"`
	QuantityAfter int       `gorm:"not null" json:"quantity_after"`
	Note          *string   `json:"note"`
	CreatedBy     *uint64   `json:"created_by"`
	CreatedAt     time.Time `json:"created_at"`
}

func (ProductStockLog) TableName() string {
	return "product_stock_logs"
}

// IngredientStockLog records movements in kitchen ingredient stock
type IngredientStockLog struct {
	ID              uint64      `gorm:"primaryKey;autoIncrement" json:"id"`
	IngredientID    uint64      `gorm:"not null" json:"ingredient_id"`
	OrderID         *uint64     `json:"order_id"`
	PurchaseOrderID *uint64     `json:"purchase_order_id"`
	Type            string      `gorm:"size:20;not null" json:"type"` // order_deduct | po_receive | adjustment | waste
	Quantity        float64     `gorm:"type:numeric(10,3);not null" json:"quantity"`
	QuantityAfter   float64     `gorm:"type:numeric(10,3);not null" json:"quantity_after"`
	Note            *string     `json:"note"`
	CreatedBy       *uint64     `json:"created_by"`
	CreatedAt       time.Time   `json:"created_at"`
	Ingredient      *Ingredient `gorm:"foreignKey:IngredientID" json:"ingredient,omitempty"`
}

func (IngredientStockLog) TableName() string {
	return "ingredient_stock_logs"
}

// StockWaste records wasted/damaged goods
type StockWaste struct {
	ID           uint64      `gorm:"primaryKey;autoIncrement" json:"id"`
	IngredientID *uint64     `json:"ingredient_id"`
	ProductID    *uint64     `json:"product_id"`
	Quantity     float64     `gorm:"type:numeric(10,3);not null" json:"quantity"`
	Reason       string      `gorm:"size:100;not null" json:"reason"` // spoiled | expired | damaged | mistake
	CostLoss     float64     `gorm:"type:numeric(10,2);default:0.00" json:"cost_loss"`
	ReportedBy   *uint64     `json:"reported_by"`
	CreatedAt    time.Time   `json:"created_at"`
	Ingredient   *Ingredient `gorm:"foreignKey:IngredientID" json:"ingredient,omitempty"`
}

func (StockWaste) TableName() string {
	return "stock_wastes"
}
