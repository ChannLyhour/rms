import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import { adminApi } from '../../../api/adminApi'
import { Button } from '../../../components/common/ButtonComponent'
import { Plus } from '@untitledui/icons'
import toast from 'react-hot-toast'

// Modular Tabs
import IngredientsTab from './tabs/IngredientsTab'
import RecipesTab from './tabs/RecipesTab'
import PurchaseOrdersTab from './tabs/PurchaseOrdersTab'
import SuppliersTab from './tabs/SuppliersTab'
import StockLogsTab from './tabs/StockLogsTab'
import WastageTab from './tabs/WastageTab'

// Modular Views & Modals
import IngredientCreateView from './views/IngredientCreateView'
import RecipeCreateView from './views/RecipeCreateView'
import POCreateView from './views/POCreateView'
import SupplierCreateView from './views/SupplierCreateView'
import WasteCreateModal from './views/WasteCreateModal'

export default function InventoryDashboard() {
  const location = useLocation()
  const navigate = useNavigate()

  // Determine active tab from URL path or query
  const activeTab = useMemo(() => {
    if (location.pathname === '/recipes') return 'recipes'
    if (location.pathname === '/purchases') return 'purchases'
    if (location.pathname === '/stock-logs') return 'logs'
    const params = new URLSearchParams(location.search)
    return params.get('tab') || 'ingredients'
  }, [location.pathname, location.search])

  // View state: 'list' | 'create_ingredient' | 'edit_ingredient' | 'create_recipe' | 'create_po' | 'create_supplier'
  const [viewMode, setViewMode] = useState('list')
  const [editingItem, setEditingItem] = useState(null)
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false)

  // Data States
  const [ingredients, setIngredients] = useState([])
  const [recipes, setRecipes] = useState([])
  const [products, setProducts] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [movementLogs, setMovementLogs] = useState([])
  const [wasteLogs, setWasteLogs] = useState([])
  const [loading, setLoading] = useState(false)

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [ingRes, recRes, prodRes, poRes, supRes, logsRes, wasteRes] = await Promise.all([
        adminApi.getIngredients().catch(() => ({ data: { data: [] } })),
        adminApi.getRecipes().catch(() => ({ data: { data: [] } })),
        adminApi.getProducts().catch(() => ({ data: { data: [] } })),
        adminApi.getPurchaseOrders().catch(() => ({ data: { data: [] } })),
        adminApi.getSuppliers().catch(() => ({ data: { data: [] } })),
        adminApi.getStockLogs().catch(() => ({ data: { data: [] } })),
        adminApi.getStockWastes().catch(() => ({ data: { data: [] } })),
      ])

      setIngredients(ingRes.data?.data || [])
      setRecipes(recRes.data?.data || [])
      setProducts(prodRes.data?.data || [])
      setPurchaseOrders(poRes.data?.data || [])
      setSuppliers(supRes.data?.data || [])
      setMovementLogs(logsRes.data?.data || [])
      setWasteLogs(wasteRes.data?.data || [])
    } catch (err) {
      console.error('Failed to load inventory data:', err)
      toast.error('Failed to load inventory details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  // Reset view when switching tabs
  useEffect(() => {
    setViewMode('list')
    setEditingItem(null)
  }, [activeTab])

  const handleTabClick = (tabKey) => {
    setViewMode('list')
    if (tabKey === 'recipes') navigate('/recipes')
    else if (tabKey === 'purchases') navigate('/purchases')
    else if (tabKey === 'logs') navigate('/stock-logs')
    else navigate('/inventory')
  }

  const renderHeaderAction = () => {
    switch (activeTab) {
      case 'ingredients':
        return (
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setEditingItem(null)
              setViewMode('create_ingredient')
            }}
            iconLeading={Plus}
          >
            Add Ingredient
          </Button>
        )
      case 'recipes':
        return (
          <Button
            variant="primary"
            size="md"
            onClick={() => setViewMode('create_recipe')}
            iconLeading={Plus}
          >
            Add Recipe Item
          </Button>
        )
      case 'purchases':
        return (
          <Button
            variant="primary"
            size="md"
            onClick={() => setViewMode('create_po')}
            iconLeading={Plus}
          >
            Create Purchase Order
          </Button>
        )
      case 'suppliers':
        return (
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setEditingItem(null)
              setViewMode('create_supplier')
            }}
            iconLeading={Plus}
          >
            Add Supplier
          </Button>
        )
      case 'logs':
      case 'waste':
      default:
        return (
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsWasteModalOpen(true)}
            iconLeading={Plus}
          >
            Record Spoilage / Waste
          </Button>
        )
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-10 select-none animate-in fade-in duration-200">
        {/* ── Top Header Row ── */}
        {viewMode === 'list' && (
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold tracking-tight text-[#072328] dark:text-[#F8F7F4]">
                  Inventory &amp; Supplies
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#126973]/15 text-[#126973] dark:text-[#F1D8C2] border border-[#126973]/30">
                  {ingredients.length} Stock Items
                </span>
              </div>
              <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                Raw ingredients, menu recipe portion formulas (BOM), inbound vendor purchase orders &amp; movement logs.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {renderHeaderAction()}
            </div>
          </div>
        )}

        {/* ── Sub Navigation Tabs ── */}
        {viewMode === 'list' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-[var(--color-border)]">
            {[
              { id: 'ingredients', label: '📦 Raw Ingredients', path: '/inventory' },
              { id: 'recipes', label: '🍳 Recipe Formulas', path: '/recipes' },
              { id: 'purchases', label: '🚚 Suppliers & POs', path: '/purchases' },
              { id: 'logs', label: '📜 Stock Movements', path: '/stock-logs' },
            ].map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#126973] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-[#126973]/10 hover:text-[#126973] dark:hover:text-[#F1D8C2]'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        )}

        {/* ── VIEW MODE: Create / Edit Drawers ── */}
        {viewMode === 'create_ingredient' && (
          <IngredientCreateView
            ingredient={null}
            onClose={() => setViewMode('list')}
            onSave={loadAllData}
          />
        )}

        {viewMode === 'edit_ingredient' && (
          <IngredientCreateView
            ingredient={editingItem}
            onClose={() => {
              setViewMode('list')
              setEditingItem(null)
            }}
            onSave={loadAllData}
          />
        )}

        {viewMode === 'create_recipe' && (
          <RecipeCreateView
            products={products}
            ingredients={ingredients}
            onClose={() => setViewMode('list')}
            onSave={loadAllData}
          />
        )}

        {viewMode === 'create_po' && (
          <POCreateView
            suppliers={suppliers}
            ingredients={ingredients}
            onClose={() => setViewMode('list')}
            onSave={loadAllData}
          />
        )}

        {viewMode === 'create_supplier' && (
          <SupplierCreateView
            supplier={null}
            onClose={() => setViewMode('list')}
            onSave={loadAllData}
          />
        )}

        {viewMode === 'edit_supplier' && (
          <SupplierCreateView
            supplier={editingItem}
            onClose={() => {
              setViewMode('list')
              setEditingItem(null)
            }}
            onSave={loadAllData}
          />
        )}

        {/* ── TAB CONTENT (When ViewMode === 'list') ── */}
        {viewMode === 'list' && (
          <>
            {activeTab === 'ingredients' && (
              <IngredientsTab
                ingredients={ingredients}
                loading={loading}
                onRefresh={loadAllData}
                onOpenCreate={() => setViewMode('create_ingredient')}
                onOpenEdit={(item) => {
                  setEditingItem(item)
                  setViewMode('edit_ingredient')
                }}
              />
            )}

            {activeTab === 'recipes' && (
              <RecipesTab
                recipes={recipes}
                products={products}
                ingredients={ingredients}
                loading={loading}
                onRefresh={loadAllData}
                onOpenCreate={(prod) => setViewMode('create_recipe')}
              />
            )}

            {activeTab === 'purchases' && (
              <PurchaseOrdersTab
                purchaseOrders={purchaseOrders}
                loading={loading}
                onRefresh={loadAllData}
                onOpenCreate={() => setViewMode('create_po')}
              />
            )}

            {activeTab === 'suppliers' && (
              <SuppliersTab
                suppliers={suppliers}
                loading={loading}
                onRefresh={loadAllData}
                onOpenCreate={() => setViewMode('create_supplier')}
                onOpenEdit={(s) => {
                  setEditingItem(s)
                  setViewMode('edit_supplier')
                }}
              />
            )}

            {activeTab === 'logs' && (
              <StockLogsTab
                movementLogs={movementLogs}
                loading={loading}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'waste' && (
              <WastageTab
                wasteLogs={wasteLogs}
                ingredients={ingredients}
                loading={loading}
                onRefresh={loadAllData}
                onOpenCreate={() => setIsWasteModalOpen(true)}
              />
            )}
          </>
        )}

        {/* Waste Logging Modal */}
        {isWasteModalOpen && (
          <WasteCreateModal
            ingredients={ingredients}
            onClose={() => setIsWasteModalOpen(false)}
            onSave={loadAllData}
          />
        )}
      </div>
    </AdminLayout>
  )
}
