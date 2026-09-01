package order

import (
	"fmt"
	"time"

	"github.com/pos-system/backend/pkg/pagination"
	"gorm.io/gorm"
)

type Repository interface {
	CreateOrder(order *Order) error
	GetNextOrderNumber() (string, error)
	GetOrderByID(id uint64) (*Order, error)
	GetOrdersBySession(sessionID uint64) ([]Order, error)
	ListOrders(status string, orderType string, sessionID *uint64, from, to *time.Time, p pagination.Params) ([]Order, int64, error)
	ListKitchenOrders() ([]Order, error)
	UpdateOrderStatus(orderID uint64, status string) error
	UpdateOrderStatusWithAccepter(orderID uint64, status string, acceptedBy *uint64, acceptedRole *string) error
	UpdateOrderItemStatus(itemID uint64, status string) error
	UpdateOrderPaymentStatus(orderID uint64, status string) error
	UpdateOrderPaymentInfo(orderID uint64, status string, method *string) error

	// Payments
	RecordPayment(p *Payment) error
	ListPayments(method string, status string, p pagination.Params) ([]Payment, int64, error)
	GetPaymentByID(id uint64) (*Payment, error)

	// Reports
	GetSalesSummary(from, to time.Time) (*SalesSummaryResponse, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetNextOrderNumber() (string, error) {
	var maxID int64
	r.db.Model(&Order{}).Select("COALESCE(MAX(id), 0)").Scan(&maxID)
	return fmt.Sprintf("ORD-%05d", maxID+1), nil
}

func (r *repository) CreateOrder(o *Order) error {
	return r.db.Create(o).Error
}

func (r *repository) GetOrderByID(id uint64) (*Order, error) {
	var o Order
	err := r.db.
		Preload("TableSession").
		Preload("TableSession.Table").
		Preload("Items").
		Preload("Items.Product").
		Preload("Items.Options").
		Preload("Items.Options.OptionValue").
		First(&o, id).Error
	if err != nil {
		return nil, err
	}
	return &o, nil
}

func (r *repository) GetOrdersBySession(sessionID uint64) ([]Order, error) {
	var orders []Order
	err := r.db.
		Preload("Items").
		Preload("Items.Product").
		Preload("Items.Options").
		Preload("Items.Options.OptionValue").
		Where("table_session_id = ?", sessionID).
		Order("created_at desc, id desc").
		Find(&orders).Error
	return orders, err
}

func (r *repository) ListOrders(status string, orderType string, sessionID *uint64, from, to *time.Time, p pagination.Params) ([]Order, int64, error) {
	var orders []Order
	var total int64

	q := r.db.Model(&Order{})

	if status != "" && status != "all" {
		q = q.Where("status = ?", status)
	}
	if orderType != "" && orderType != "all" {
		q = q.Where("order_type = ?", orderType)
	}
	if sessionID != nil && *sessionID > 0 {
		q = q.Where("table_session_id = ?", *sessionID)
	}
	if from != nil && to != nil {
		q = q.Where("created_at BETWEEN ? AND ?", *from, *to)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Preload("TableSession").
		Preload("TableSession.Table").
		Preload("Items").
		Preload("Items.Product").
		Preload("Items.Options").
		Preload("Items.Options.OptionValue").
		Order("created_at desc").
		Limit(p.Limit).
		Offset(p.Offset).
		Find(&orders).Error

	return orders, total, err
}

func (r *repository) ListKitchenOrders() ([]Order, error) {
	var orders []Order
	err := r.db.
		Preload("TableSession").
		Preload("TableSession.Table").
		Preload("Items").
		Preload("Items.Product").
		Preload("Items.Options").
		Preload("Items.Options.OptionValue").
		Where("status IN ('preparing', 'cooking', 'ready')").
		Order("created_at asc").
		Find(&orders).Error
	return orders, err
}

func (r *repository) UpdateOrderStatus(orderID uint64, status string) error {
	tx := r.db.Begin()
	
	if err := tx.Model(&Order{}).
		Where("id = ?", orderID).
		Update("status", status).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := r.syncOrderItemsStatus(tx, orderID, status); err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (r *repository) UpdateOrderStatusWithAccepter(orderID uint64, status string, acceptedBy *uint64, acceptedRole *string) error {
	updates := map[string]interface{}{
		"status": status,
	}
	if acceptedBy != nil {
		updates["accepted_by"] = *acceptedBy
		updates["accepted_at"] = time.Now()
	}
	if acceptedRole != nil && *acceptedRole != "" {
		updates["accepted_role"] = *acceptedRole
	}

	tx := r.db.Begin()
	if err := tx.Model(&Order{}).
		Where("id = ?", orderID).
		Updates(updates).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := r.syncOrderItemsStatus(tx, orderID, status); err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (r *repository) syncOrderItemsStatus(tx *gorm.DB, orderID uint64, orderStatus string) error {
	var itemStatus string
	switch orderStatus {
	case "preparing":
		itemStatus = "pending"
	case "ready":
		itemStatus = "ready"
	case "completed":
		itemStatus = "served"
	case "cancelled":
		itemStatus = "cancelled"
	default:
		return nil
	}

	// Update all items that are not already cancelled
	return tx.Model(&OrderItem{}).
		Where("order_id = ? AND item_status != 'cancelled'", orderID).
		Update("item_status", itemStatus).Error
}

func (r *repository) UpdateOrderItemStatus(itemID uint64, status string) error {
	return r.db.Model(&OrderItem{}).
		Where("id = ?", itemID).
		Update("item_status", status).Error
}

func (r *repository) UpdateOrderPaymentStatus(orderID uint64, status string) error {
	return r.db.Model(&Order{}).
		Where("id = ?", orderID).
		Update("payment_status", status).Error
}

func (r *repository) UpdateOrderPaymentInfo(orderID uint64, status string, method *string) error {
	updates := map[string]interface{}{
		"payment_status": status,
	}
	if method != nil && *method != "" {
		updates["payment_method"] = *method
	}
	return r.db.Model(&Order{}).
		Where("id = ?", orderID).
		Updates(updates).Error
}

func (r *repository) RecordPayment(p *Payment) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(p).Error; err != nil {
			return err
		}
		return tx.Model(&Order{}).
			Where("table_session_id = ?", p.TableSessionID).
			Updates(map[string]interface{}{
				"payment_status": "paid",
				"payment_method": p.PaymentMethod,
			}).Error
	})
}

func (r *repository) ListPayments(method string, status string, p pagination.Params) ([]Payment, int64, error) {
	var payments []Payment
	var total int64

	q := r.db.Model(&Payment{}).Preload("TableSession").Preload("Cashier")
	if method != "" {
		q = q.Where("payment_method = ?", method)
	}
	if status != "" {
		q = q.Where("payment_status = ?", status)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("paid_at desc").Limit(p.Limit).Offset(p.Offset).Find(&payments).Error
	return payments, total, err
}

func (r *repository) GetPaymentByID(id uint64) (*Payment, error) {
	var p Payment
	err := r.db.Preload("TableSession").Preload("Cashier").First(&p, id).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *repository) GetSalesSummary(from, to time.Time) (*SalesSummaryResponse, error) {
	res := &SalesSummaryResponse{}

	// Aggregate completed orders
	r.db.Model(&Order{}).
		Where("status = 'completed' AND created_at BETWEEN ? AND ?", from, to).
		Select("COALESCE(SUM(total_amount), 0) as total_revenue, COUNT(id) as total_orders, COALESCE(SUM(tax_amount), 0) as total_tax").
		Row().
		Scan(&res.TotalRevenue, &res.TotalOrders, &res.TotalTax)

	res.OrderCount = res.TotalOrders

	// Payment breakdowns
	r.db.Model(&Payment{}).
		Where("paid_at BETWEEN ? AND ?", from, to).
		Select("payment_method, COALESCE(SUM(amount_paid), 0) as total, COUNT(id) as count").
		Group("payment_method").
		Scan(&res.PaymentBreakdown)

	for _, pb := range res.PaymentBreakdown {
		switch pb.PaymentMethod {
		case "cash":
			res.TotalCash += pb.Total
		case "credit_card", "card":
			res.TotalCard += pb.Total
		case "qr_promptpay", "qr_stripe", "qr_payment", "qr":
			res.TotalQR += pb.Total
		}
	}

	return res, nil
}

