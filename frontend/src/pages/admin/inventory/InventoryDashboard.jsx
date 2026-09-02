import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import { adminApi } from '../../../api/adminApi'
import { CreateButton } from '../../../components/common/ButtonComponent'
import { Package, Utensils, Truck, History, AlertOctagon, Building2 } from 'lucide-react'
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
    else if (tabKey === 'ingredients') navigate('/inventory')
    else navigate(`/inventory?tab=${tabKey}`)
  }

  const renderHeaderAction = () => {
    switch (activeTab) {
      case 'ingredients':
        return (
          <CreateButton
            label="Add Ingredient"
            onClick={() => {
              setEditingItem(null)
              setViewMode('create_ingredient')
            }}
          />
        )
      case 'purchases':
        return (
          <CreateButton
            label="Create Purchase Order"
            onClick={() => setViewMode('create_po')}
          />
        )
      case 'recipes':
        return (
          <CreateButton
            label="Add Recipe Formula"
            onClick={() => setViewMode('create_recipe')}
          />
        )
      case 'waste':
        return (
          <CreateButton
            label="Record Waste / Spoilage"
            onClick={() => setIsWasteModalOpen(true)}
          />
        )
      case 'suppliers':
        return (
          <CreateButton
            label="Add Supplier"
            onClick={() => {
              setEditingItem(null)
              setViewMode('create_supplier')
            }}
          />
        )
      case 'logs':
      default:
        return (
          <CreateButton
            label="Record Waste / Spoilage"
            onClick={() => setIsWasteModalOpen(true)}
          />
        )
    }
  }

  const tabsConfig = [
    {
      id: 'ingredients',
      label: 'Raw Ingredients',
      icon: Package,
      count: ingredients.length,
    },
    {
      id: 'purchases',
      label: 'Suppliers & POs',
      icon: Truck,
      count: purchaseOrders.length,
    },
    {
      id: 'recipes',
      label: 'Recipe Formulas (BOM)',
      icon: Utensils,
      count: recipes.length,
    },
    {
      id: 'waste',
      label: 'Waste & Spoilage',
      icon: AlertOctagon,
      count: wasteLogs.length,
    },
    {
      id: 'suppliers',
      label: 'Suppliers Directory',
      icon: Building2,
      count: suppliers.length,
    },
    {
      id: 'logs',
      label: 'Stock Movements',
      icon: History,
      count: movementLogs.length,
    },
  ]

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
                <h1
                  className="text-xl font-extrabold tracking-tight"
                  style={{ color: 'var(--color-text)' }}
                >
                  Inventory &amp; Supplies
                </h1>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    background: 'rgba(18, 105, 115, 0.15)',
                    color: 'var(--color-500, #126973)',
                    border: '1px solid rgba(18, 105, 115, 0.3)',
                  }}
                >
                  {ingredients.length} Stock Items
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                Raw ingredients, menu recipe portion formulas (BOM), inbound vendor purchase orders &amp; movement logs.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {renderHeaderAction()}
            </div>
          </div>
        )}

        {/* ── Sub Navigation Tabs (Same UI as Products.jsx Venue Tabs) ── */}
        {viewMode === 'list' && (
          <div className="relative">
            {/* Fade effect on mobile */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--color-bg)] to-transparent pointer-events-none z-10 sm:hidden" />

            <div
              className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-xl p-1 border"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'var(--color-border)',
              }}
            >
              {tabsConfig.map((tab) => {
                const IconComponent = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabClick(tab.id)}
                    className={`inline-flex items-center gap-2.5 h-10 px-3.5 rounded-xl text-sm transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'shadow-xs font-semibold'
                        : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    style={
                      isActive
                        ? {
                            background: 'var(--color-surface, #1e2230)',
                            color: 'var(--color-text, #ffffff)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            border: '1px solid var(--color-border)',
                          }
                        : {
                            color: 'var(--color-muted, #94a3b8)',
                          }
                    }
                  >
                    <IconComponent
                      size={18}
                      className={isActive ? 'shrink-0 text-[#126973] dark:text-[#F1D8C2]' : 'shrink-0 text-slate-400'}
                    />
                    <span>{tab.label}</span>
                    <span
                      className="inline-flex items-center justify-center rounded-lg px-2 h-5 text-[11px] font-semibold"
                      style={{
                        background: isActive
                          ? 'rgba(18, 105, 115, 0.18)'
                          : 'rgba(255, 255, 255, 0.06)',
                        color: isActive ? 'var(--color-500, #126973)' : 'var(--color-muted, #94a3b8)',
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>
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

            {activeTab === 'purchases' && (
              <PurchaseOrdersTab
                purchaseOrders={purchaseOrders}
                loading={loading}
                onRefresh={loadAllData}
                onOpenCreate={() => setViewMode('create_po')}
              />
            )}

            {activeTab === 'recipes' && (
              <RecipesTab
                recipes={recipes}
                products={products}
                ingredients={ingredients}
                loading={loading}
                onRefresh={loadAllData}
                onOpenCreate={() => setViewMode('create_recipe')}
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
