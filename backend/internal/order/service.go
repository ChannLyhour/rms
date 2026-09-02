package order

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/pos-system/backend/internal/enum"
	"github.com/pos-system/backend/internal/products"
	"github.com/pos-system/backend/internal/system"
	"github.com/pos-system/backend/pkg/pagination"
)

type Service interface {
	CreateOrder(req *CreateOrderRequest, orderType string, createdBy *uuid.UUID) (*Order, error)
	GetOrderByID(id uuid.UUID) (*Order, error)
	GetOrdersBySession(sessionID uuid.UUID) ([]Order, error)
	ListOrders(status string, orderType string, sessionID *uuid.UUID, from, to *time.Time, p pagination.Params) ([]Order, int64, error)
	ListKitchenOrders() ([]Order, error)
	UpdateOrderStatus(orderID uuid.UUID, status string) error
	UpdateOrderStatusWithAccepter(orderID uuid.UUID, status string, acceptedBy *uuid.UUID, acceptedRole *string) error
	UpdateOrderItemStatus(itemID uuid.UUID, status string) error
	UpdateOrderPaymentStatus(orderID uuid.UUID, status string) error
	UpdateOrderPaymentInfo(orderID uuid.UUID, status string, method *string) error

	// Payments
	ProcessPayment(req *ProcessPaymentRequest, cashierID *uuid.UUID) (*Payment, error)
	ListPayments(method string, status string, p pagination.Params) ([]Payment, int64, error)
	GetPaymentByID(id uuid.UUID) (*Payment, error)

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

func (s *service) CreateOrder(req *CreateOrderRequest, orderType string, createdBy *uuid.UUID) (*Order, error) {
	if len(req.Items) == 0 {
		return nil, errors.New("order must contain at least one item")
	}

	var subtotal float64
	var orderItems []OrderItem

	for _, itemReq := range req.Items {
		prod, err := s.productRepo.GetProductByID(itemReq.ProductID)
		if err != nil {
			return nil, fmt.Errorf("product id %s not found", itemReq.ProductID)
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
			ItemStatus:          enum.ItemStatusPending,
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

	paymentStatus := enum.PaymentStatusUnpaid
	if req.PaymentStatus != "" {
		paymentStatus = enum.PaymentStatus(req.PaymentStatus)
	}

	var paymentMethod *enum.PaymentMethod
	if req.PaymentMethod != nil && *req.PaymentMethod != "" {
		pm := enum.PaymentMethod(*req.PaymentMethod)
		paymentMethod = &pm
	}

	order := &Order{
		OutletID:       req.OutletID,
		TableSessionID: req.TableSessionID,
		OrderNumber:    orderNumber,
		OrderType:      enum.OrderType(orderType),
		Status:         enum.OrderStatusPending,
		PaymentStatus:  paymentStatus,
		PaymentMethod:  paymentMethod,
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

func (s *service) GetOrderByID(id uuid.UUID) (*Order, error) {
	return s.repo.GetOrderByID(id)
}

func (s *service) GetOrdersBySession(sessionID uuid.UUID) ([]Order, error) {
	return s.repo.GetOrdersBySession(sessionID)
}

func (s *service) ListOrders(status string, orderType string, sessionID *uuid.UUID, from, to *time.Time, p pagination.Params) ([]Order, int64, error) {
	return s.repo.ListOrders(status, orderType, sessionID, from, to, p)
}

func (s *service) ListKitchenOrders() ([]Order, error) {
	return s.repo.ListKitchenOrders()
}

func (s *service) UpdateOrderStatus(orderID uuid.UUID, status string) error {
	return s.UpdateOrderStatusWithAccepter(orderID, status, nil, nil)
}

func (s *service) UpdateOrderStatusWithAccepter(orderID uuid.UUID, status string, acceptedBy *uuid.UUID, acceptedRole *string) error {
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

func (s *service) UpdateOrderItemStatus(itemID uuid.UUID, status string) error {
	return s.repo.UpdateOrderItemStatus(itemID, status)
}

func (s *service) UpdateOrderPaymentStatus(orderID uuid.UUID, status string) error {
	return s.repo.UpdateOrderPaymentStatus(orderID, status)
}

func (s *service) UpdateOrderPaymentInfo(orderID uuid.UUID, status string, method *string) error {
	return s.repo.UpdateOrderPaymentInfo(orderID, status, method)
}

func (s *service) ProcessPayment(req *ProcessPaymentRequest, cashierID *uuid.UUID) (*Payment, error) {
	var changeGiven float64
	if req.AmountReceived > req.AmountPaid {
		changeGiven = req.AmountReceived - req.AmountPaid
	}

	p := &Payment{
		OrderID:        req.OrderID,
		TableSessionID: req.TableSessionID,
		CashierID:      cashierID,
		PaymentMethod:  enum.PaymentMethod(req.PaymentMethod),
		AmountPaid:     req.AmountPaid,
		ChangeGiven:    changeGiven,
		PaymentStatus:  enum.PaymentStatusPaid,
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

func (s *service) GetPaymentByID(id uuid.UUID) (*Payment, error) {
	return s.repo.GetPaymentByID(id)
}

func (s *service) GetSalesSummary(from, to time.Time) (*SalesSummaryResponse, error) {
	return s.repo.GetSalesSummary(from, to)
}
