package enum

// ── Order Status ─────────────────────────────────────────────────────────────

// OrderStatus defines the operation lifecycle state of an order
type OrderStatus string

const (
	OrderStatusPending   OrderStatus = "pending"   // Order created / awaiting confirmation
	OrderStatusPreparing OrderStatus = "preparing" // In-kitchen cooking or barista brewing
	OrderStatusReady     OrderStatus = "ready"     // Food cooked or drinks ready for pickup/serving
	OrderStatusCompleted OrderStatus = "completed" // Served & session closed / direct checkout
	OrderStatusCancelled OrderStatus = "cancelled" // Cancelled / voided
)

// String returns the string representation of OrderStatus
func (s OrderStatus) String() string {
	return string(s)
}

// IsValid checks if the OrderStatus is a recognized value
func (s OrderStatus) IsValid() bool {
	switch s {
	case OrderStatusPending, OrderStatusPreparing, OrderStatusReady, OrderStatusCompleted, OrderStatusCancelled:
		return true
	}
	return false
}

// ── Payment Status ───────────────────────────────────────────────────────────

// PaymentStatus defines the financial settlement state of an order
type PaymentStatus string

const (
	PaymentStatusUnpaid            PaymentStatus = "unpaid"             // Not paid yet (e.g. Dine-In pay later)
	PaymentStatusPaid              PaymentStatus = "paid"               // Fully settled (e.g. KHQR, Cash, Card)
	PaymentStatusPartiallyRefunded PaymentStatus = "partially_refunded" // Some items refunded
	PaymentStatusRefunded          PaymentStatus = "refunded"           // Fully refunded to customer
	PaymentStatusFailed            PaymentStatus = "failed"             // Payment transaction failed
)

func (p PaymentStatus) String() string {
	return string(p)
}

func (p PaymentStatus) IsValid() bool {
	switch p {
	case PaymentStatusUnpaid, PaymentStatusPaid, PaymentStatusPartiallyRefunded, PaymentStatusRefunded, PaymentStatusFailed:
		return true
	}
	return false
}

// ── Order Item Status ────────────────────────────────────────────────────────

// ItemStatus defines the kitchen / fulfillment preparation state for each order line item
type ItemStatus string

const (
	ItemStatusPending   ItemStatus = "pending"   // Waiting in kitchen queue
	ItemStatusPreparing ItemStatus = "preparing" // Chef is currently cooking this item
	ItemStatusReady     ItemStatus = "ready"     // Food ready to be served (bell rang)
	ItemStatusServed    ItemStatus = "served"    // Delivered to customer table
	ItemStatusCancelled ItemStatus = "cancelled" // Single line item cancelled
	ItemStatusRefunded  ItemStatus = "refunded"  // Item returned & refunded
)

func (i ItemStatus) String() string {
	return string(i)
}

func (i ItemStatus) IsValid() bool {
	switch i {
	case ItemStatusPending, ItemStatusPreparing, ItemStatusReady, ItemStatusServed, ItemStatusCancelled, ItemStatusRefunded:
		return true
	}
	return false
}

// ── Order Type ───────────────────────────────────────────────────────────────

// OrderType defines the channel / ordering method
type OrderType string

const (
	OrderTypeDineIn   OrderType = "dine_in"   // Table service dining
	OrderTypeTakeaway OrderType = "takeaway"  // Pick-up / Takeout
	OrderTypeDelivery OrderType = "delivery"  // Courier / Delivery
	OrderTypeQRScan   OrderType = "qr_scan"   // Customer self-order QR
)

func (t OrderType) String() string {
	return string(t)
}

// ── Payment Method ───────────────────────────────────────────────────────────

// PaymentMethod defines the supported payment channels
type PaymentMethod string

const (
	PaymentMethodCash       PaymentMethod = "cash"
	PaymentMethodCreditCard PaymentMethod = "credit_card"
	PaymentMethodABAKHQR    PaymentMethod = "aba_khqr"
	PaymentMethodPromptPay  PaymentMethod = "qr_promptpay"
	PaymentMethodStripe     PaymentMethod = "qr_stripe"
)

func (m PaymentMethod) String() string {
	return string(m)
}
