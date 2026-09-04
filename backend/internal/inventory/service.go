package inventory

import (
	"github.com/google/uuid"
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

func (s *Service) GetSupplier(id uuid.UUID) (*Supplier, error) {
	return s.repo.GetSupplierByID(id)
}

func (s *Service) CreateSupplier(sup *Supplier) error {
	return s.repo.CreateSupplier(sup)
}

func (s *Service) UpdateSupplier(id uuid.UUID, sup *Supplier) error {
	return s.repo.UpdateSupplier(id, sup)
}

func (s *Service) DeleteSupplier(id uuid.UUID) error {
	return s.repo.DeleteSupplier(id)
}

// ── Ingredient Categories ────────────────────────────────────────

func (s *Service) ListIngredientCategories(search string) ([]IngredientCategory, error) {
	return s.repo.ListIngredientCategories(search)
}

func (s *Service) GetIngredientCategory(id uuid.UUID) (*IngredientCategory, error) {
	return s.repo.GetIngredientCategoryByID(id)
}

func (s *Service) CreateIngredientCategory(cat *IngredientCategory) error {
	return s.repo.CreateIngredientCategory(cat)
}

func (s *Service) UpdateIngredientCategory(id uuid.UUID, cat *IngredientCategory) error {
	return s.repo.UpdateIngredientCategory(id, cat)
}

func (s *Service) DeleteIngredientCategory(id uuid.UUID) error {
	return s.repo.DeleteIngredientCategory(id)
}

// ── Ingredients ──────────────────────────────────────────────────

func (s *Service) ListIngredients(search string, lowStock bool, categoryID *uuid.UUID, p pagination.Params) ([]Ingredient, int64, error) {
	return s.repo.ListIngredients(search, lowStock, categoryID, p)
}

func (s *Service) GetIngredient(id uuid.UUID) (*Ingredient, error) {
	return s.repo.GetIngredientByID(id)
}

func (s *Service) CreateIngredient(ing *Ingredient) error {
	return s.repo.CreateIngredient(ing)
}

func (s *Service) UpdateIngredient(id uuid.UUID, ing *Ingredient) error {
	return s.repo.UpdateIngredient(id, ing)
}

func (s *Service) DeleteIngredient(id uuid.UUID) error {
	return s.repo.DeleteIngredient(id)
}

// ── Recipes ──────────────────────────────────────────────────────

func (s *Service) ListRecipes(productID *uuid.UUID, p pagination.Params) ([]Recipe, int64, error) {
	return s.repo.ListRecipes(productID, p)
}

func (s *Service) GetRecipe(id uuid.UUID) (*Recipe, error) {
	return s.repo.GetRecipeByID(id)
}

func (s *Service) CreateRecipe(rec *Recipe) error {
	return s.repo.CreateRecipe(rec)
}

func (s *Service) UpdateRecipe(id uuid.UUID, rec *Recipe) error {
	return s.repo.UpdateRecipe(id, rec)
}

func (s *Service) DeleteRecipe(id uuid.UUID) error {
	return s.repo.DeleteRecipe(id)
}

// ── Purchase Orders ──────────────────────────────────────────────

func (s *Service) ListPurchaseOrders(supplierID *uuid.UUID, status string, p pagination.Params) ([]PurchaseOrder, int64, error) {
	return s.repo.ListPurchaseOrders(supplierID, status, p)
}

func (s *Service) GetPurchaseOrder(id uuid.UUID) (*PurchaseOrder, error) {
	return s.repo.GetPurchaseOrderByID(id)
}

func (s *Service) CreatePurchaseOrder(po *PurchaseOrder) error {
	return s.repo.CreatePurchaseOrder(po)
}

func (s *Service) UpdatePurchaseOrderStatus(id uuid.UUID, status string) error {
	return s.repo.UpdatePurchaseOrderStatus(id, status)
}

func (s *Service) DeletePurchaseOrder(id uuid.UUID) error {
	return s.repo.DeletePurchaseOrder(id)
}

// ── Stock Logs & Movements ───────────────────────────────────────

func (s *Service) ListIngredientStockLogs(ingredientID *uuid.UUID, p pagination.Params) ([]IngredientStockLog, int64, error) {
	return s.repo.ListIngredientStockLogs(ingredientID, p)
}

func (s *Service) CreateIngredientStockLog(log *IngredientStockLog) error {
	return s.repo.CreateIngredientStockLog(log)
}

func (s *Service) ListProductStockLogs(productID *uuid.UUID, p pagination.Params) ([]ProductStockLog, int64, error) {
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
