package order

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/pos-system/backend/internal/products"
	"github.com/pos-system/backend/internal/system"
	"github.com/pos-system/backend/pkg/pagination"
)

type Service interface {
	CreateOrder(req *CreateOrderRequest, orderType string, createdBy *uint64) (*Order, error)
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
	ProcessPayment(req *ProcessPaymentRequest, cashierID *uint64) (*Payment, error)
	ListPayments(method string, status string, p pagination.Params) ([]Payment, int64, error)
	GetPaymentByID(id uint64) (*Payment, error)

	// Reports
	GetSalesSummary(from, to time.Time) (*SalesSummaryResponse, error)
}

type service struct {
	repo        Repository
	productRepo products.Repository
	systemRepo  system.Repository
	taxRate     float64 // e.g. 7.0 for 7%
}

func NewService(repo Repository, productRepo products.Repository, systemRepo system.Repository, taxRate float64) Service {
	return &service{
		repo:        repo,
		productRepo: productRepo,
		systemRepo:  systemRepo,
		taxRate:     taxRate,
	}
}

func (s *service) getEffectiveTaxRate() float64 {
	if s.systemRepo != nil {
		setting, err := s.systemRepo.GetSettingByKey("tax_rate")
		if err == nil && setting != nil && setting.SettingValue != nil {
			if rate, err := strconv.ParseFloat(*setting.SettingValue, 64); err == nil && rate >= 0 {
				return rate
			}
		}
	}
	return s.taxRate
}

func (s *service) CreateOrder(req *CreateOrderRequest, orderType string, createdBy *uint64) (*Order, error) {
	if len(req.Items) == 0 {
		return nil, errors.New("order must contain at least one item")
	}

	var subtotal float64
	var orderItems []OrderItem

	for _, itemReq := range req.Items {
		prod, err := s.productRepo.GetProductByID(itemReq.ProductID)
		if err != nil {
			return nil, fmt.Errorf("product id %d not found", itemReq.ProductID)
		}

		unitPrice := prod.Price
		var itemSubtotal = unitPrice * float64(itemReq.Quantity)
		var options []OrderItemOption

		for _, optID := range itemReq.OptionValueIDs {
			options = append(options, OrderItemOption{
				OptionValueID: optID,
				Price:         0,
				CreatedBy:     createdBy,
			})
		}

		subtotal += itemSubtotal
		pid := itemReq.ProductID
		itemName := prod.Name
		if itemReq.ItemProductName != nil && *itemReq.ItemProductName != "" {
			itemName = *itemReq.ItemProductName
		}
		orderItems = append(orderItems, OrderItem{
			ProductID:           &pid,
			ItemProductName:     itemName,
			Quantity:            itemReq.Quantity,
			UnitPrice:           unitPrice,
			SpecialInstructions: itemReq.SpecialInstructions,
			ItemStatus:          "pending",
			CreatedBy:           createdBy,
			Options:             options,
		})
	}

	effectiveTaxRate := s.getEffectiveTaxRate()
	taxAmount := subtotal * (effectiveTaxRate / 100.0)
	totalAmount := subtotal + taxAmount

	orderNumber, _ := s.repo.GetNextOrderNumber()
	if orderNumber == "" {
		orderNumber = fmt.Sprintf("ORD-%05d", 1)
	}

	paymentStatus := "unpaid"
	if req.PaymentStatus != "" {
		paymentStatus = req.PaymentStatus
	}

	order := &Order{
		TableSessionID: req.TableSessionID,
		OrderNumber:    orderNumber,
		OrderType:      orderType,
		Status:         "pending",
		PaymentStatus:  paymentStatus,
		PaymentMethod:  req.PaymentMethod,
		Subtotal:       subtotal,
		TaxAmount:      taxAmount,
		TotalAmount:    totalAmount,
		CreatedBy:      createdBy,
		Items:          orderItems,
	}

	if err := s.repo.CreateOrder(order); err != nil {
		return nil, err
	}

	return s.repo.GetOrderByID(order.ID)
}

func (s *service) GetOrderByID(id uint64) (*Order, error) {
	return s.repo.GetOrderByID(id)
}

func (s *service) GetOrdersBySession(sessionID uint64) ([]Order, error) {
	return s.repo.GetOrdersBySession(sessionID)
}

func (s *service) ListOrders(status string, orderType string, sessionID *uint64, from, to *time.Time, p pagination.Params) ([]Order, int64, error) {
	return s.repo.ListOrders(status, orderType, sessionID, from, to, p)
}

func (s *service) ListKitchenOrders() ([]Order, error) {
	return s.repo.ListKitchenOrders()
}

func (s *service) UpdateOrderStatus(orderID uint64, status string) error {
	return s.UpdateOrderStatusWithAccepter(orderID, status, nil, nil)
}

func (s *service) UpdateOrderStatusWithAccepter(orderID uint64, status string, acceptedBy *uint64, acceptedRole *string) error {
	if err := s.repo.UpdateOrderStatusWithAccepter(orderID, status, acceptedBy, acceptedRole); err != nil {
		return err
	}

	// Synchronize item statuses when order status changes
	itemStatusMap := map[string]string{
		"pending":   "pending",
		"preparing": "preparing",
		"cooking":   "preparing",
		"ready":     "ready",
		"completed": "served",
		"cancelled": "cancelled",
	}

	if targetItemStatus, exists := itemStatusMap[status]; exists {
		order, err := s.repo.GetOrderByID(orderID)
		if err == nil && order != nil {
			for _, item := range order.Items {
				_ = s.repo.UpdateOrderItemStatus(item.ID, targetItemStatus)
			}
		}
	}
	return nil
}

func (s *service) UpdateOrderItemStatus(itemID uint64, status string) error {
	return s.repo.UpdateOrderItemStatus(itemID, status)
}

func (s *service) UpdateOrderPaymentStatus(orderID uint64, status string) error {
	return s.repo.UpdateOrderPaymentStatus(orderID, status)
}

func (s *service) UpdateOrderPaymentInfo(orderID uint64, status string, method *string) error {
	return s.repo.UpdateOrderPaymentInfo(orderID, status, method)
}

func (s *service) ProcessPayment(req *ProcessPaymentRequest, cashierID *uint64) (*Payment, error) {
	var changeGiven float64
	if req.AmountReceived > req.AmountPaid {
		changeGiven = req.AmountReceived - req.AmountPaid
	}

	p := &Payment{
		TableSessionID: req.TableSessionID,
		CashierID:      cashierID,
		PaymentMethod:  req.PaymentMethod,
		AmountPaid:     req.AmountPaid,
		ChangeGiven:    changeGiven,
		PaymentStatus:  "completed",
		TransactionRef: req.TransactionRef,
		CreatedBy:      cashierID,
		PaidAt:         time.Now(),
	}

	if err := s.repo.RecordPayment(p); err != nil {
		return nil, err
	}

	return p, nil
}

func (s *service) ListPayments(method string, status string, p pagination.Params) ([]Payment, int64, error) {
	return s.repo.ListPayments(method, status, p)
}

func (s *service) GetPaymentByID(id uint64) (*Payment, error) {
	return s.repo.GetPaymentByID(id)
}

func (s *service) GetSalesSummary(from, to time.Time) (*SalesSummaryResponse, error) {
	return s.repo.GetSalesSummary(from, to)
}
