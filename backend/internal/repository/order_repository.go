package repository

import (
	"fmt"

	"github.com/pos-system/backend/internal/domain"
	"gorm.io/gorm"
)

// OrderRepository handles order database operations
type OrderRepository struct {
	db *gorm.DB
}

// NewOrderRepository creates a new OrderRepository
func NewOrderRepository(db *gorm.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

// GetNextOrderNumber calculates the next sequential order number
func (r *OrderRepository) GetNextOrderNumber() string {
	var maxID int64
	r.db.Model(&domain.Order{}).Select("COALESCE(MAX(id), 0)").Scan(&maxID)
	return fmt.Sprintf("ORD-%05d", maxID+1)
}

// CreateOrder inserts a complete order with items and options
func (r *OrderRepository) CreateOrder(order *domain.Order) error {
	return r.db.Create(order).Error
}

// FindOrderByID returns an order with full item and option details
func (r *OrderRepository) FindOrderByID(id uint64) (*domain.Order, error) {
	var order domain.Order
	err := r.db.
		Preload("Items.Product").
		Preload("Items.Options.OptionValue").
		First(&order, id).Error
	return &order, err
}

// FindOrderByNumber returns an order by its display number
func (r *OrderRepository) FindOrderByNumber(num string) (*domain.Order, error) {
	var order domain.Order
	err := r.db.
		Preload("Items.Product").
		Preload("Items.Options.OptionValue").
		Where("order_number = ?", num).First(&order).Error
	return &order, err
}

// ListOrdersBySession returns all orders for a given table session
func (r *OrderRepository) ListOrdersBySession(sessionID uint64) ([]domain.Order, error) {
	var orders []domain.Order
	err := r.db.
		Preload("Items.Product").
		Preload("Items.Options.OptionValue").
		Where("table_session_id = ?", sessionID).
		Order("created_at ASC").Find(&orders).Error
	return orders, err
}

// ListKitchenOrders returns active orders visible to kitchen staff
func (r *OrderRepository) ListKitchenOrders() ([]domain.Order, error) {
	var orders []domain.Order
	err := r.db.
		Preload("Items.Product").
		Preload("Items.Options.OptionValue").
		Where("status IN ('confirmed','preparing')").
		Order("created_at ASC").Find(&orders).Error
	return orders, err
}

// UpdateOrderStatus changes the status of an order and logs it
func (r *OrderRepository) UpdateOrderStatus(orderID uint64, from, to string, userID *uint64) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&domain.Order{}).Where("id = ?", orderID).Update("status", to).Error; err != nil {
			return err
		}
		log := &domain.OrderStatusLog{
			OrderID:         orderID,
			ChangedByUserID: userID,
			StatusFrom:      from,
			StatusTo:        to,
		}
		return tx.Create(log).Error
	})
}

// UpdateOrderItemStatus changes the status of a single order item
func (r *OrderRepository) UpdateOrderItemStatus(itemID uint64, status string) error {
	return r.db.Model(&domain.OrderItem{}).Where("id = ?", itemID).Update("item_status", status).Error
}

// CreatePayment inserts a payment record
func (r *OrderRepository) CreatePayment(p *domain.Payment) error {
	return r.db.Create(p).Error
}

// SalesSummary returns total revenue for a given date range
func (r *OrderRepository) SalesSummary(from, to string) (float64, int64, error) {
	type Result struct {
		Total float64
		Count int64
	}
	var res Result
	err := r.db.Model(&domain.Order{}).
		Select("SUM(total_amount) as total, COUNT(*) as count").
		Where("status = 'completed' AND created_at BETWEEN ? AND ?", from, to).
		Scan(&res).Error
	return res.Total, res.Count, err
}
