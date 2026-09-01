package domain

import "time"

// Order represents a customer order within a table session
type Order struct {
	ID             uint64      `gorm:"primaryKey;autoIncrement" json:"id"`
	TableSessionID uint64      `gorm:"not null" json:"table_session_id"`
	OrderNumber    string      `gorm:"uniqueIndex;size:50;not null" json:"order_number"`
	OrderType      string      `gorm:"size:20;default:'qr_scan'" json:"order_type"` // qr_scan | cashier
	Status         string      `gorm:"size:20;default:'pending'" json:"status"`      // pending | confirmed | preparing | ready | completed | cancelled
	PaymentStatus  string      `gorm:"column:payment_status;size:20;default:'unpaid'" json:"payment_status"` // unpaid | paid | refunded
	PaymentMethod  *string     `gorm:"column:payment_method;size:50" json:"payment_method"`
	Subtotal       float64     `gorm:"type:numeric(10,2);default:0.00" json:"subtotal"`
	TaxAmount      float64     `gorm:"type:numeric(10,2);default:0.00" json:"tax_amount"`
	TotalAmount    float64     `gorm:"type:numeric(10,2);default:0.00" json:"total_amount"`
	CreatedBy      *uint64     `json:"created_by"`
	CreatedAt      time.Time   `json:"created_at"`
	UpdatedAt      time.Time   `json:"updated_at"`
	Items          []OrderItem `gorm:"foreignKey:OrderID" json:"items,omitempty"`
}

// OrderItem represents a single product line in an order
type OrderItem struct {
	ID                  uint64            `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID             uint64            `gorm:"not null" json:"order_id"`
	ProductID           *uint64           `json:"product_id"`
	Quantity            int               `gorm:"default:1" json:"quantity"`
	UnitPrice           float64           `gorm:"type:numeric(10,2);default:0.00" json:"unit_price"`
	SpecialInstructions *string           `json:"special_instructions"`
	ItemStatus          string            `gorm:"size:20;default:'pending'" json:"item_status"`
	CreatedBy           *uint64           `json:"created_by"`
	CreatedAt           time.Time         `json:"created_at"`
	UpdatedAt           time.Time         `json:"updated_at"`
	Product             *Product          `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Options             []OrderItemOption `gorm:"foreignKey:OrderItemID" json:"options,omitempty"`
}

// OrderItemOption stores a selected option for an order item
type OrderItemOption struct {
	ID            uint64   `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderItemID   uint64   `gorm:"not null" json:"order_item_id"`
	OptionValueID uint64   `gorm:"not null" json:"option_value_id"`
	Price         float64  `gorm:"type:numeric(10,2);default:0.00" json:"price"`
	CreatedBy     *uint64  `json:"created_by"`
	OptionValue   *OptionValue `gorm:"foreignKey:OptionValueID" json:"option_value,omitempty"`
}

// Payment represents a payment for a table session
type Payment struct {
	ID             uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	TableSessionID uint64     `gorm:"not null" json:"table_session_id"`
	CashierID      *uint64    `json:"cashier_id"`
	PaymentMethod  string     `gorm:"size:20;default:'cash'" json:"payment_method"` // cash | card | qr_payment
	AmountPaid     float64    `gorm:"type:numeric(10,2);default:0.00" json:"amount_paid"`
	ChangeGiven    float64    `gorm:"type:numeric(10,2);default:0.00" json:"change_given"`
	PaymentStatus  string     `gorm:"column:payment_status;size:20;default:'completed'" json:"payment_status"`
	TransactionRef *string    `gorm:"size:255" json:"transaction_ref"`
	CreatedBy      *uint64    `json:"created_by"`
	PaidAt         time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"paid_at"`
}

// OrderStatusLog records every order status change
type OrderStatusLog struct {
	ID              uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID         uint64    `gorm:"not null" json:"order_id"`
	ChangedByUserID *uint64   `json:"changed_by_user_id"`
	StatusFrom      string    `gorm:"size:50;not null" json:"status_from"`
	StatusTo        string    `gorm:"size:50;not null" json:"status_to"`
	CreatedBy       *uint64   `json:"created_by"`
	CreatedAt       time.Time `json:"created_at"`
}

// CreateOrderRequest is the payload for creating a new order
type CreateOrderRequest struct {
	TableSessionID uint64            `json:"table_session_id" binding:"required"`
	OrderType      string            `json:"order_type"`
	Items          []CreateOrderItem `json:"items" binding:"required,min=1"`
}

// CreateOrderItem is a single item in a CreateOrderRequest
type CreateOrderItem struct {
	ProductID           uint64   `json:"product_id" binding:"required"`
	Quantity            int      `json:"quantity" binding:"required,min=1"`
	SpecialInstructions *string  `json:"special_instructions"`
	OptionValueIDs      []uint64 `json:"option_value_ids"`
}

// ProcessPaymentRequest is the payload for processing a payment
type ProcessPaymentRequest struct {
	TableSessionID uint64  `json:"table_session_id" binding:"required"`
	PaymentMethod  string  `json:"payment_method" binding:"required"`
	AmountPaid     float64 `json:"amount_paid" binding:"required,min=0"`
	TransactionRef *string `json:"transaction_ref"`
}

// UpdateOrderStatusRequest is the payload for updating order/item status
type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required"`
}
