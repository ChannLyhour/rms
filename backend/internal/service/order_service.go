package service

import (
	"fmt"
	"time"

	"github.com/pos-system/backend/internal/domain"
	"github.com/pos-system/backend/internal/repository"
)

// OrderService handles order business logic
type OrderService struct {
	orderRepo   *repository.OrderRepository
	productRepo *repository.ProductRepository
	taxRate     float64
}

// NewOrderService creates a new OrderService
func NewOrderService(orderRepo *repository.OrderRepository, productRepo *repository.ProductRepository, taxRate float64) *OrderService {
	return &OrderService{orderRepo: orderRepo, productRepo: productRepo, taxRate: taxRate}
}

// CreateOrder validates and persists a new order
func (s *OrderService) CreateOrder(req *domain.CreateOrderRequest, userID *uint64) (*domain.Order, error) {
	order := &domain.Order{
		TableSessionID: req.TableSessionID,
		OrderNumber:    s.orderRepo.GetNextOrderNumber(),
		OrderType:      req.OrderType,
		Status:         "pending",
		CreatedBy:      userID,
	}
	if order.OrderType == "" {
		order.OrderType = "dine_in"
	}

	var subtotal float64
	for _, itemReq := range req.Items {
		product, err := s.productRepo.FindProductByID(itemReq.ProductID)
		if err != nil {
			return nil, fmt.Errorf("product %d not found", itemReq.ProductID)
		}

		itemName := product.Name
		if itemReq.ItemProductName != nil && *itemReq.ItemProductName != "" {
			itemName = *itemReq.ItemProductName
		}

		item := domain.OrderItem{
			ProductID:           product.ID,
			ItemProductName:     itemName,
			Quantity:            itemReq.Quantity,
			UnitPrice:           product.Price,
			SpecialInstructions: itemReq.SpecialInstructions,
			ItemStatus:          "pending",
			CreatedBy:           userID,
		}

		lineTotal := product.Price * float64(itemReq.Quantity)

		// Attach selected options
		for _, ovID := range itemReq.OptionValueIDs {
			item.Options = append(item.Options, domain.OrderItemOption{
				OptionValueID: ovID,
				Price:         0, // price is looked up and can be populated here
				CreatedBy:     userID,
			})
		}

		subtotal += lineTotal
		order.Items = append(order.Items, item)
	}

	taxAmount := subtotal * (s.taxRate / 100)
	order.Subtotal = subtotal
	order.TaxAmount = taxAmount
	order.TotalAmount = subtotal + taxAmount

	if err := s.orderRepo.CreateOrder(order); err != nil {
		return nil, fmt.Errorf("failed to save order: %w", err)
	}

	return order, nil
}

// ListKitchenOrders returns orders pending or being prepared
func (s *OrderService) ListKitchenOrders() ([]domain.Order, error) {
	return s.orderRepo.ListKitchenOrders()
}

// UpdateStatus transitions an order's status
func (s *OrderService) UpdateStatus(orderID uint64, status string, userID *uint64) error {
	order, err := s.orderRepo.FindOrderByID(orderID)
	if err != nil {
		return fmt.Errorf("order not found")
	}
	if err := s.orderRepo.UpdateOrderStatus(orderID, order.Status, status, userID); err != nil {
		return err
	}

	itemStatusMap := map[string]string{
		"pending":   "pending",
		"preparing": "preparing",
		"cooking":   "preparing",
		"ready":     "ready",
		"completed": "served",
		"cancelled": "cancelled",
	}
	if targetItemStatus, exists := itemStatusMap[status]; exists {
		for _, item := range order.Items {
			_ = s.orderRepo.UpdateOrderItemStatus(item.ID, targetItemStatus)
		}
	}
	return nil
}

// ProcessPayment creates a payment and closes the session
func (s *OrderService) ProcessPayment(req *domain.ProcessPaymentRequest, cashierID uint64) (*domain.Payment, error) {
	change := req.AmountPaid // simplified; deduct total in real logic
	payment := &domain.Payment{
		TableSessionID: req.TableSessionID,
		CashierID:      &cashierID,
		PaymentMethod:  req.PaymentMethod,
		AmountPaid:     req.AmountPaid,
		ChangeGiven:    change,
		PaymentStatus:  "completed",
		TransactionRef: req.TransactionRef,
		CreatedBy:      &cashierID,
		PaidAt:         time.Now(),
	}
	if err := s.orderRepo.CreatePayment(payment); err != nil {
		return nil, err
	}

	return payment, nil
}

// GetSummary returns sales summary for a date range
func (s *OrderService) GetSummary(from, to string) (float64, int64, error) {
	return s.orderRepo.SalesSummary(from, to)
}

// GetOrdersBySession returns all orders for a session
func (s *OrderService) GetOrdersBySession(sessionID uint64) ([]domain.Order, error) {
	return s.orderRepo.ListOrdersBySession(sessionID)
}

func generateOrderNumber() string {
	return fmt.Sprintf("ORD-%d", time.Now().UnixMilli())
}
