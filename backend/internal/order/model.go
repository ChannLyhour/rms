package order

import (
	"time"

	"github.com/pos-system/backend/internal/enum"
	"github.com/pos-system/backend/internal/products"
	"github.com/pos-system/backend/internal/table"
)

// Order represents an order placed by cashier or QR customer
type Order struct {
	ID             uint64              `gorm:"primaryKey;autoIncrement" json:"id"`
	TableSessionID uint64              `gorm:"not null" json:"table_session_id"`
	OrderNumber    string              `gorm:"uniqueIndex;size:50;not null" json:"order_number"`
	OrderType      enum.OrderType      `gorm:"size:20;default:'qr_scan'" json:"order_type"` // qr_scan | pos_direct | takeaway
	Status         enum.OrderStatus    `gorm:"size:20;default:'pending'" json:"status"`                 // pending | preparing | ready | completed | cancelled
	PaymentStatus  enum.PaymentStatus  `gorm:"column:payment_status;size:20;default:'unpaid'" json:"payment_status"` // unpaid | paid | refunded
	PaymentMethod  *enum.PaymentMethod `gorm:"column:payment_method;size:50" json:"payment_method"`
	Subtotal       float64             `gorm:"type:numeric(10,2);default:0.00" json:"subtotal"`
	TaxAmount      float64             `gorm:"type:numeric(10,2);default:0.00" json:"tax_amount"`
	TotalAmount    float64             `gorm:"type:numeric(10,2);default:0.00" json:"total_amount"`
	CreatedBy      *uint64             `json:"created_by"`
	AcceptedBy     *uint64             `gorm:"column:accepted_by" json:"accepted_by"`
	AcceptedRole   *string             `gorm:"column:accepted_role;size:50" json:"accepted_role"`
	AcceptedAt     *time.Time          `gorm:"column:accepted_at" json:"accepted_at"`
	CreatedAt      time.Time           `json:"created_at"`
	UpdatedAt      time.Time           `json:"updated_at"`
	TableSession   *table.TableSession `gorm:"foreignKey:TableSessionID" json:"table_session,omitempty"`
	Items          []OrderItem         `gorm:"foreignKey:OrderID" json:"items,omitempty"`
}

// OrderItem represents a line item in an order
type OrderItem struct {
	ID                  uint64            `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID             uint64            `gorm:"not null" json:"order_id"`
	ProductID           *uint64           `json:"product_id"`
	ItemProductName     string            `gorm:"column:item_product_name;size:255" json:"item_product_name"`
	Quantity            int               `gorm:"default:1" json:"quantity"`
	UnitPrice           float64           `gorm:"type:numeric(10,2);default:0.00" json:"unit_price"`
	SpecialInstructions *string           `json:"special_instructions"`
	ItemStatus          enum.ItemStatus   `gorm:"size:20;default:'pending'" json:"item_status"` // pending | preparing | ready | served | cancelled
	CreatedBy           *uint64           `json:"created_by"`
	CreatedAt           time.Time         `json:"created_at"`
	UpdatedAt           time.Time         `json:"updated_at"`
	Product             *products.Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Options             []OrderItemOption `gorm:"foreignKey:OrderItemID" json:"options,omitempty"`
}

// OrderItemOption represents selected option values for an order item
type OrderItemOption struct {
	ID            uint64                `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderItemID   uint64                `gorm:"not null" json:"order_item_id"`
	OptionValueID uint64                `gorm:"not null" json:"option_value_id"`
	Price         float64               `gorm:"type:numeric(10,2);default:0.00" json:"price"`
	CreatedBy     *uint64               `json:"created_by"`
	OptionValue   *products.OptionValue `gorm:"foreignKey:OptionValueID" json:"option_value,omitempty"`
}

// Payment records a transaction
type Payment struct {
	ID             uint64             `gorm:"primaryKey;autoIncrement" json:"id"`
	TableSessionID uint64             `gorm:"not null" json:"table_session_id"`
	CashierID      *uint64            `json:"cashier_id"`
	PaymentMethod  enum.PaymentMethod `gorm:"size:20;not null;default:'cash'" json:"payment_method"` // cash | credit_card | aba_khqr
	AmountPaid     float64            `gorm:"type:numeric(10,2);default:0.00" json:"amount_paid"`
	ChangeGiven    float64            `gorm:"type:numeric(10,2);default:0.00" json:"change_given"`
	PaymentStatus  enum.PaymentStatus `gorm:"column:payment_status;size:20;default:'paid'" json:"payment_status"`
	TransactionRef *string            `gorm:"size:255" json:"transaction_ref"`
	CreatedBy      *uint64            `json:"created_by"`
	PaidAt         time.Time          `gorm:"default:CURRENT_TIMESTAMP" json:"paid_at"`
}

// OrderItemInput payload for creating items
type OrderItemInput struct {
	ProductID           uint64   `json:"product_id" binding:"required"`
	ItemProductName     *string  `json:"item_product_name"`
	Quantity            int      `json:"quantity" binding:"required,min=1"`
	SpecialInstructions *string  `json:"special_instructions"`
	OptionValueIDs      []uint64 `json:"option_value_ids"`
}

// CreateOrderRequest payload
type CreateOrderRequest struct {
	TableSessionID uint64           `json:"table_session_id"`
	OrderType      string           `json:"order_type"` // qr_scan | pos_direct | takeaway
	PaymentMethod  *string          `json:"payment_method"`
	PaymentStatus  string           `json:"payment_status"`
	Items          []OrderItemInput `json:"items" binding:"required,min=1"`
}

// UpdateOrderStatusRequest payload
type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

// ProcessPaymentRequest payload
type ProcessPaymentRequest struct {
	TableSessionID uint64  `json:"table_session_id" binding:"required"`
	PaymentMethod  string  `json:"payment_method" binding:"required"`
	AmountPaid     float64 `json:"amount_paid" binding:"required,min=0"`
	AmountReceived float64 `json:"amount_received"`
	TransactionRef *string `json:"transaction_ref"`
}

// PayCustomerTicketRequest payload for customer QR single ticket payment
type PayCustomerTicketRequest struct {
	OrderID       uint64  `json:"order_id" binding:"required"`
	PaymentMethod string  `json:"payment_method"`
}

// PaymentBreakdownItem struct for sales aggregation by method
type PaymentBreakdownItem struct {
	PaymentMethod string  `json:"payment_method"`
	Total         float64 `json:"total"`
	Count         int64   `json:"count"`
}

// SalesSummaryResponse payload
type SalesSummaryResponse struct {
	TotalRevenue     float64                `json:"total_revenue"`
	TotalOrders      int64                  `json:"total_orders"`
	OrderCount       int64                  `json:"order_count"`
	TotalTax         float64                `json:"total_tax"`
	TotalCash        float64                `json:"total_cash"`
	TotalCard        float64                `json:"total_card"`
	TotalQR          float64                `json:"total_qr"`
	PaymentBreakdown []PaymentBreakdownItem `json:"payment_breakdown"`
}

