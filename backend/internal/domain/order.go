package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/pos-system/backend/internal/enum"
)

// Order represents a customer order within a table session
type Order struct {
	ID             uuid.UUID           `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OutletID       *uuid.UUID          `gorm:"type:uuid" json:"outlet_id"`
	TableSessionID *uuid.UUID          `gorm:"type:uuid" json:"table_session_id"`
	OrderNumber    string              `gorm:"uniqueIndex;size:50;not null" json:"order_number"`
	OrderType      enum.OrderType      `gorm:"size:20;default:'qr_scan'" json:"order_type"` // qr_scan | cashier
	Status         enum.OrderStatus    `gorm:"size:20;default:'pending'" json:"status"`      // pending | preparing | ready | completed | cancelled
	PaymentStatus  enum.PaymentStatus  `gorm:"column:payment_status;size:20;default:'unpaid'" json:"payment_status"` // unpaid | paid | refunded
	PaymentMethod  *enum.PaymentMethod `gorm:"column:payment_method;size:50" json:"payment_method"`
	Subtotal       float64             `gorm:"type:numeric(10,2);default:0.00" json:"subtotal"`
	TaxAmount      float64             `gorm:"type:numeric(10,2);default:0.00" json:"tax_amount"`
	TotalAmount    float64             `gorm:"type:numeric(10,2);default:0.00" json:"total_amount"`
	AcceptedBy     *uuid.UUID          `gorm:"type:uuid" json:"accepted_by"`
	AcceptedRole   *string             `gorm:"size:50" json:"accepted_role"`
	AcceptedAt     *time.Time          `json:"accepted_at"`
	CreatedBy      *uuid.UUID          `gorm:"type:uuid" json:"created_by"`
	CreatedAt      time.Time           `json:"created_at"`
	UpdatedAt      time.Time           `json:"updated_at"`
	Items          []OrderItem         `gorm:"foreignKey:OrderID" json:"items,omitempty"`
	Outlet         *Outlet             `gorm:"foreignKey:OutletID" json:"outlet,omitempty"`
}

// OrderItem represents a single product line in an order
type OrderItem struct {
	ID                  uuid.UUID         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OrderID             uuid.UUID         `gorm:"type:uuid;not null" json:"order_id"`
	ProductID           *uuid.UUID        `gorm:"type:uuid" json:"product_id"`
	ItemProductName     string            `gorm:"column:item_product_name;size:255" json:"item_product_name"`
	Quantity            int               `gorm:"default:1" json:"quantity"`
	UnitPrice           float64           `gorm:"type:numeric(10,2);default:0.00" json:"unit_price"`
	SpecialInstructions *string           `json:"special_instructions"`
	ItemStatus          enum.ItemStatus   `gorm:"size:20;default:'pending'" json:"item_status"`
	CreatedBy           *uuid.UUID        `gorm:"type:uuid" json:"created_by"`
	CreatedAt           time.Time         `json:"created_at"`
	UpdatedAt           time.Time         `json:"updated_at"`
	Product             *Product          `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Options             []OrderItemOption `gorm:"foreignKey:OrderItemID" json:"options,omitempty"`
}

// OrderItemOption stores a selected option for an order item
type OrderItemOption struct {
	ID            uuid.UUID    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OrderItemID   uuid.UUID    `gorm:"type:uuid;not null" json:"order_item_id"`
	OptionValueID uuid.UUID    `gorm:"type:uuid;not null" json:"option_value_id"`
	Price         float64      `gorm:"type:numeric(10,2);default:0.00" json:"price"`
	CreatedBy     *uuid.UUID   `gorm:"type:uuid" json:"created_by"`
	OptionValue   *OptionValue `gorm:"foreignKey:OptionValueID" json:"option_value,omitempty"`
}

// Payment represents a payment for a table session or order
type Payment struct {
	ID             uuid.UUID          `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OrderID        *uuid.UUID         `gorm:"type:uuid" json:"order_id"`
	TableSessionID *uuid.UUID         `gorm:"type:uuid" json:"table_session_id"`
	CashierID      *uuid.UUID         `gorm:"type:uuid" json:"cashier_id"`
	PaymentMethod  enum.PaymentMethod `gorm:"size:20;default:'cash'" json:"payment_method"` // cash | credit_card | aba_khqr
	AmountPaid     float64            `gorm:"type:numeric(10,2);default:0.00" json:"amount_paid"`
	ChangeGiven    float64            `gorm:"type:numeric(10,2);default:0.00" json:"change_given"`
	PaymentStatus  enum.PaymentStatus `gorm:"column:payment_status;size:20;default:'paid'" json:"payment_status"`
	TransactionRef *string            `gorm:"size:255" json:"transaction_ref"`
	CreatedBy      *uuid.UUID         `gorm:"type:uuid" json:"created_by"`
	PaidAt         time.Time          `gorm:"default:CURRENT_TIMESTAMP" json:"paid_at"`
}

// OrderStatusLog records every order status change
type OrderStatusLog struct {
	ID              uuid.UUID        `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OrderID         uuid.UUID        `gorm:"type:uuid;not null" json:"order_id"`
	ChangedByUserID *uuid.UUID       `gorm:"type:uuid" json:"changed_by_user_id"`
	StatusFrom      enum.OrderStatus `gorm:"size:50;not null" json:"status_from"`
	StatusTo        enum.OrderStatus `gorm:"size:50;not null" json:"status_to"`
	CreatedBy       *uuid.UUID       `gorm:"type:uuid" json:"created_by"`
	CreatedAt       time.Time        `json:"created_at"`
}

// CreateOrderRequest is the payload for creating a new order
type CreateOrderRequest struct {
	OutletID       *uuid.UUID        `json:"outlet_id"`
	TableSessionID *uuid.UUID        `json:"table_session_id"`
	OrderType      string            `json:"order_type"`
	Items          []CreateOrderItem `json:"items" binding:"required,min=1"`
}

// CreateOrderItem is a single item in a CreateOrderRequest
type CreateOrderItem struct {
	ProductID           uuid.UUID   `json:"product_id" binding:"required"`
	ItemProductName     *string     `json:"item_product_name"`
	Quantity            int         `json:"quantity" binding:"required,min=1"`
	SpecialInstructions *string     `json:"special_instructions"`
	OptionValueIDs      []uuid.UUID `json:"option_value_ids"`
}

// ProcessPaymentRequest is the payload for processing a payment
type ProcessPaymentRequest struct {
	OrderID        *uuid.UUID `json:"order_id"`
	TableSessionID *uuid.UUID `json:"table_session_id"`
	PaymentMethod  string     `json:"payment_method" binding:"required"`
	AmountPaid     float64    `json:"amount_paid" binding:"required,min=0"`
	TransactionRef *string    `json:"transaction_ref"`
}

// UpdateOrderStatusRequest is the payload for updating order/item status
type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required"`
}
