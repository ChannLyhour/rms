package inventory

import (
	"github.com/pos-system/backend/pkg/pagination"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// ── Suppliers ────────────────────────────────────────────────────

func (s *Service) ListSuppliers(search string, p pagination.Params) ([]Supplier, int64, error) {
	return s.repo.ListSuppliers(search, p)
}

func (s *Service) GetSupplier(id uint64) (*Supplier, error) {
	return s.repo.GetSupplierByID(id)
}

func (s *Service) CreateSupplier(sup *Supplier) error {
	return s.repo.CreateSupplier(sup)
}

func (s *Service) UpdateSupplier(id uint64, sup *Supplier) error {
	return s.repo.UpdateSupplier(id, sup)
}

func (s *Service) DeleteSupplier(id uint64) error {
	return s.repo.DeleteSupplier(id)
}

// ── Ingredients ──────────────────────────────────────────────────

func (s *Service) ListIngredients(search string, lowStock bool, p pagination.Params) ([]Ingredient, int64, error) {
	return s.repo.ListIngredients(search, lowStock, p)
}

func (s *Service) GetIngredient(id uint64) (*Ingredient, error) {
	return s.repo.GetIngredientByID(id)
}

func (s *Service) CreateIngredient(ing *Ingredient) error {
	return s.repo.CreateIngredient(ing)
}

func (s *Service) UpdateIngredient(id uint64, ing *Ingredient) error {
	return s.repo.UpdateIngredient(id, ing)
}

func (s *Service) DeleteIngredient(id uint64) error {
	return s.repo.DeleteIngredient(id)
}

// ── Recipes ──────────────────────────────────────────────────────

func (s *Service) ListRecipes(productID *uint64, p pagination.Params) ([]Recipe, int64, error) {
	return s.repo.ListRecipes(productID, p)
}

func (s *Service) GetRecipe(id uint64) (*Recipe, error) {
	return s.repo.GetRecipeByID(id)
}

func (s *Service) CreateRecipe(rec *Recipe) error {
	return s.repo.CreateRecipe(rec)
}

func (s *Service) UpdateRecipe(id uint64, rec *Recipe) error {
	return s.repo.UpdateRecipe(id, rec)
}

func (s *Service) DeleteRecipe(id uint64) error {
	return s.repo.DeleteRecipe(id)
}

// ── Purchase Orders ──────────────────────────────────────────────

func (s *Service) ListPurchaseOrders(supplierID *uint64, status string, p pagination.Params) ([]PurchaseOrder, int64, error) {
	return s.repo.ListPurchaseOrders(supplierID, status, p)
}

func (s *Service) GetPurchaseOrder(id uint64) (*PurchaseOrder, error) {
	return s.repo.GetPurchaseOrderByID(id)
}

func (s *Service) CreatePurchaseOrder(po *PurchaseOrder) error {
	return s.repo.CreatePurchaseOrder(po)
}

func (s *Service) UpdatePurchaseOrderStatus(id uint64, status string) error {
	return s.repo.UpdatePurchaseOrderStatus(id, status)
}

func (s *Service) DeletePurchaseOrder(id uint64) error {
	return s.repo.DeletePurchaseOrder(id)
}

// ── Stock Logs & Movements ───────────────────────────────────────

func (s *Service) ListIngredientStockLogs(ingredientID *uint64, p pagination.Params) ([]IngredientStockLog, int64, error) {
	return s.repo.ListIngredientStockLogs(ingredientID, p)
}

func (s *Service) CreateIngredientStockLog(log *IngredientStockLog) error {
	return s.repo.CreateIngredientStockLog(log)
}

func (s *Service) ListProductStockLogs(productID *uint64, p pagination.Params) ([]ProductStockLog, int64, error) {
	return s.repo.ListProductStockLogs(productID, p)
}

func (s *Service) CreateProductStockLog(log *ProductStockLog) error {
	return s.repo.CreateProductStockLog(log)
}

func (s *Service) ListStockWastes(p pagination.Params) ([]StockWaste, int64, error) {
	return s.repo.ListStockWastes(p)
}

func (s *Service) CreateStockWaste(waste *StockWaste) error {
	return s.repo.CreateStockWaste(waste)
}
