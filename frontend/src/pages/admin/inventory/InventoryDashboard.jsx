import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AdminLayout from '../../../components/layout/AdminLayout'
import { adminApi } from '../../../api/adminApi'
import { CreateButton } from '../../../components/common/ButtonComponent'
import toast from 'react-hot-toast'

// Modular Module Pages
import IngredientsPage from './pages/IngredientsPage'
import RecipesPage from './pages/RecipesPage'
import PurchaseOrdersPage from './pages/PurchaseOrdersPage'
import SuppliersPage from './pages/SuppliersPage'
import StockLogsPage from './pages/StockLogsPage'
import WastagePage from './pages/WastagePage'

// Modular Views & Modals
import IngredientCreateView from './views/IngredientCreateView'
import RecipeCreateView from './views/RecipeCreateView'
import POCreateView from './views/POCreateView'
import SupplierCreateView from './views/SupplierCreateView'
import WasteCreateModal from './views/WasteCreateModal'

// 3D Isometric Module Illustrations
import raw3dImg from './3D/raw.png'
import po3dImg from './3D/POs-Suppliers.png'
import recipe3dImg from './3D/Recipes.png'
import waste3dImg from './3D/Waste.png'
import stock3dImg from './3D/Stock-Movements.png'
import supplier3dImg from './3D/Suppliers.png'

export default function InventoryDashboard() {
  const location = useLocation()
  const navigate = useNavigate()

  // Determine active tab from URL path or query (null on first load so only cards show)
  const activeTab = useMemo(() => {
    if (location.pathname === '/recipes') return 'recipes'
    if (location.pathname === '/purchases') return 'purchases'
    if (location.pathname === '/stock-logs') return 'logs'
    const params = new URLSearchParams(location.search)
    return params.get('tab') || null
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
        adminApi.getIngredients({ limit: 200 }).catch(() => ({ data: { data: [] } })),
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
    // If clicking the already selected card, toggle back to overview
    if (tabKey === activeTab) {
      navigate('/inventory')
      return
    }
    if (tabKey === 'recipes') navigate('/recipes')
    else if (tabKey === 'purchases') navigate('/purchases')
    else if (tabKey === 'logs') navigate('/stock-logs')
    else navigate(`/inventory?tab=${tabKey}`)
  }

  const lowStockCount = useMemo(() => {
    return ingredients.filter((i) => Number(i.stock_quantity) <= Number(i.low_stock_threshold)).length
  }, [ingredients])

  const renderHeaderAction = () => {
    if (!activeTab) return null
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
        return <CreateButton label="Create Purchase Order" onClick={() => setViewMode('create_po')} />
      case 'recipes':
        return <CreateButton label="Add Recipe Formula" onClick={() => setViewMode('create_recipe')} />
      case 'waste':
        return <CreateButton label="Record Waste / Spoilage" onClick={() => setIsWasteModalOpen(true)} />
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
        return <CreateButton label="Record Waste / Spoilage" onClick={() => setIsWasteModalOpen(true)} />
    }
  }

  // Cards Configuration following the HTML template
  const cards = [
    {
      id: 'ingredients',
      title: 'Raw Materials',
      subtitle: 'Track ingredients, units and current stock levels',
      bgImage: raw3dImg,
      patternId: 'raw-pattern',
      patternStroke: '#059669',
      shadowColor: 'hover:shadow-[0_20px_35px_-8px_rgba(5,150,105,0.25)] hover:border-emerald-300 dark:hover:border-emerald-600',
      bottomBorder: 'border-b-emerald-500/40',
      footerLeft: `${ingredients.length} items`,
      footerRight: lowStockCount > 0 ? `${lowStockCount} low stock` : 'Healthy stock',
      footerRightBadge: lowStockCount > 0
        ? 'font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full'
        : 'font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full',
    },
    {
      id: 'purchases',
      title: 'POs & Suppliers',
      subtitle: 'Purchase orders and supplier management',
      bgImage: po3dImg,
      patternId: 'po-pattern',
      patternStroke: '#2563eb',
      shadowColor: 'hover:shadow-[0_20px_35px_-8px_rgba(37,99,235,0.25)] hover:border-blue-300 dark:hover:border-blue-600',
      bottomBorder: 'border-b-blue-500/40',
      footerLeft: `${purchaseOrders.length} active POs`,
      footerRight: `${suppliers.length} suppliers`,
      footerRightBadge: 'text-slate-500 dark:text-slate-400 font-medium',
    },
    {
      id: 'recipes',
      title: 'Recipes',
      subtitle: 'Recipe costing and ingredient mapping',
      bgImage: recipe3dImg,
      patternId: 'recipe-pattern',
      patternStroke: '#7c3aed',
      shadowColor: 'hover:shadow-[0_20px_35px_-8px_rgba(124,58,237,0.25)] hover:border-violet-300 dark:hover:border-violet-600',
      bottomBorder: 'border-b-violet-500/40',
      footerLeft: `${recipes.length} recipes`,
      footerRight: 'Linked to menu',
      footerRightBadge: 'text-slate-500 dark:text-slate-400 font-medium',
    },
    {
      id: 'waste',
      title: 'Waste & Spoilage',
      subtitle: 'Log and analyze food waste and spoilage',
      bgImage: waste3dImg,
      patternId: 'waste-pattern',
      patternStroke: '#e11d48',
      shadowColor: 'hover:shadow-[0_20px_35px_-8px_rgba(225,29,72,0.25)] hover:border-rose-300 dark:hover:border-rose-600',
      bottomBorder: 'border-b-rose-500/40',
      footerLeft: `${wasteLogs.length} logs recorded`,
      footerRight: 'Loss tracking',
      footerRightBadge: 'font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 rounded-full',
    },
    {
      id: 'logs',
      title: 'Stock Movements',
      subtitle: 'Current inventory levels and stock movements',
      bgImage: stock3dImg,
      patternId: 'stock-pattern',
      patternStroke: '#d97706',
      shadowColor: 'hover:shadow-[0_20px_35px_-8px_rgba(217,119,6,0.25)] hover:border-amber-300 dark:hover:border-amber-600',
      bottomBorder: 'border-b-amber-500/40',
      footerLeft: `${movementLogs.length} movements`,
      footerRight: 'Audit history',
      footerRightBadge: 'text-slate-500 dark:text-slate-400 font-medium',
    },
    {
      id: 'suppliers',
      title: 'Supplier Directory',
      subtitle: 'Vendor contacts, pricing terms and directories',
      bgImage: supplier3dImg,
      patternId: 'supplier-pattern',
      patternStroke: '#0d9488',
      shadowColor: 'hover:shadow-[0_20px_35px_-8px_rgba(13,148,136,0.25)] hover:border-teal-300 dark:hover:border-teal-600',
      bottomBorder: 'border-b-teal-500/40',
      footerLeft: `${suppliers.length} vendors`,
      footerRight: 'Active partners',
      footerRightBadge: 'text-slate-500 dark:text-slate-400 font-medium',
    },
  ]

  const activeCard = useMemo(() => {
    return cards.find((c) => c.id === activeTab) || null
  }, [cards, activeTab])

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12 select-none">
        {/* SVG Doodle Patterns Definitions */}
        <svg className="hidden" aria-hidden="true">
          <defs>
            {/* Raw Pattern: Carrot, Tomato, Mushroom, Fish */}
            <pattern id="raw-pattern" width="130" height="130" patternUnits="userSpaceOnUse">
              <g transform="translate(20,15)" stroke="#059669" fill="none" strokeWidth="1.5" strokeLinecap="round">
                <path d="M8 2c0 0-3.5 4.5-3.5 9.5s3.5 7 3.5 7 3.5-2.5 3.5-7S8 2 8 2z" />
                <path d="M8 2v3M5.5 5l1.8 1.8M10.5 5L8.7 6.8" />
              </g>
              <g transform="translate(80,20)" stroke="#059669" fill="none" strokeWidth="1.5">
                <circle cx="8" cy="10" r="6.5" />
                <path d="M8 3.5s2-2.5 4.5-1.5" strokeLinecap="round" />
              </g>
              <g transform="translate(25,85)" stroke="#059669" fill="none" strokeWidth="1.5">
                <path d="M4 12c0-4.5 3.2-7.5 7-7.5s7 3 7 7.5" />
                <line x1="11" y1="12" x2="11" y2="19" />
              </g>
              <g transform="translate(85,90)" stroke="#059669" fill="none" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 9c3.5-3.5 8-3.5 11.5 0s2.8 5.5 0 6.5c-3.5 1-8 1-11.5-2.5" />
                <circle cx="5" cy="7.5" r="1" fill="#059669" />
              </g>
            </pattern>

            {/* PO Pattern: Cheese, Egg */}
            <pattern id="po-pattern" width="110" height="110" patternUnits="userSpaceOnUse">
              <g transform="translate(18,22)" stroke="#2563eb" fill="none" strokeWidth="1.4">
                <path d="M2 15h15l-2.5-11H4.5z" />
                <circle cx="7" cy="9" r="1.3" />
                <circle cx="12" cy="7" r="1.1" />
              </g>
              <g transform="translate(70,60)" stroke="#2563eb" fill="none" strokeWidth="1.4">
                <ellipse cx="8" cy="10" rx="5.5" ry="7.5" />
              </g>
            </pattern>

            {/* Recipe Pattern: Chef Hat, Corn */}
            <pattern id="recipe-pattern" width="120" height="120" patternUnits="userSpaceOnUse">
              <g transform="translate(22,18)" stroke="#7c3aed" fill="none" strokeWidth="1.4">
                <path d="M3 15h14v2.5H3z" />
                <path d="M5 15c0-4.5 2.5-8 6-8s6 3.5 6 8" />
              </g>
              <g transform="translate(75,65)" stroke="#7c3aed" fill="none" strokeWidth="1.4">
                <path d="M8 2c0 0-3 2.5-3 9s3 11 3 11 3-4.5 3-11-3-9-3-9z" />
                <path d="M5 7h6M5 11h6M5 15h6" />
              </g>
            </pattern>

            {/* Waste Pattern: Shrimp, Leaf */}
            <pattern id="waste-pattern" width="110" height="110" patternUnits="userSpaceOnUse">
              <g transform="translate(20,25)" stroke="#e11d48" fill="none" strokeWidth="1.4" strokeLinecap="round">
                <path d="M3 11c2.5-4.5 7-5.5 10-3" />
                <path d="M13 8c2 1.5 3 3.5 2 5.5" />
              </g>
              <g transform="translate(70,65)" stroke="#e11d48" fill="none" strokeWidth="1.4">
                <path d="M8 4c4 2.5 6 7 5 11-3.5 1.5-8-1-10-5.5 1.5-3.5 3.5-6 5-5.5z" />
              </g>
            </pattern>

            {/* Stock Pattern: Meat, Plant */}
            <pattern id="stock-pattern" width="120" height="120" patternUnits="userSpaceOnUse">
              <g transform="translate(22,20)" stroke="#d97706" fill="none" strokeWidth="1.4">
                <path d="M6 7c0-2.5 2.5-4.5 5.5-4.5s5.5 2 5.5 4.5c0 3.5-2.5 6-5.5 9-3-3-5.5-5.5-5.5-9z" />
              </g>
              <g transform="translate(75,70)" stroke="#d97706" fill="none" strokeWidth="1.4">
                <path d="M8 18v-7" />
                <path d="M8 11c-3.5-2.5-5-6-2.5-8.5" />
                <path d="M8 11c3.5-2.5 5-6 2.5-8.5" />
              </g>
            </pattern>

            {/* Supplier Pattern: Building, Truck */}
            <pattern id="supplier-pattern" width="120" height="120" patternUnits="userSpaceOnUse">
              <g transform="translate(20,20)" stroke="#0d9488" fill="none" strokeWidth="1.4">
                <rect x="2" y="2" width="16" height="18" rx="2" />
                <line x1="6" y1="6" x2="8" y2="6" />
                <line x1="12" y1="6" x2="14" y2="6" />
                <line x1="6" y1="10" x2="8" y2="10" />
                <line x1="12" y1="10" x2="14" y2="10" />
              </g>
              <g transform="translate(72,65)" stroke="#0d9488" fill="none" strokeWidth="1.4">
                <rect x="2" y="5" width="12" height="9" rx="1" />
                <path d="M14 8h4l2 3v3h-6z" />
                <circle cx="5" cy="15" r="1.5" />
                <circle cx="17" cy="15" r="1.5" />
              </g>
            </pattern>
          </defs>
        </svg>

        {/* ── OVERVIEW PAGE: Top Header (Only shown when on overview) ── */}
        {viewMode === 'list' && !activeTab && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
                Inventory &amp; Supplies
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage stock, recipes, suppliers and waste tracking
              </p>
            </div>
          </div>
        )}

        {/* ── OVERVIEW PAGE: Cards Grid (Only shown when on overview) ── */}
        {viewMode === 'list' && !activeTab && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((card) => {
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleTabClick(card.id)}
                  className={`group relative text-left overflow-hidden rounded-2xl bg-gradient-to-b from-white to-slate-50/70 dark:from-slate-900 dark:to-slate-950/90 border border-slate-200/90 dark:border-slate-800 border-b-[3px] ${card.bottomBorder} shadow-[0_6px_16px_-4px_rgba(0,0,0,0.07),0_2px_4px_rgba(0,0,0,0.03)] ${card.shadowColor} hover:-translate-y-1.5 active:translate-y-0 active:shadow-sm transition-all duration-300 cursor-pointer`}
                >
                  {/* Card Background: 3D Artwork Image or Subtle SVG Doodles Pattern */}
                  {card.bgImage ? (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                      <img
                        src={card.bgImage}
                        alt=""
                        className="absolute -right-2 top-0 bottom-0 w-52 h-full object-cover object-center opacity-45 dark:opacity-50 group-hover:opacity-75 group-hover:scale-108 group-hover:-translate-y-1 transition-all duration-500"
                        style={{
                          maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 28%, black 100%)',
                          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 28%, black 100%)',
                        }}
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.14] group-hover:opacity-[0.14] dark:group-hover:opacity-[0.22] transition-opacity duration-300 pointer-events-none">
                      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100%" height="100%" fill={`url(#${card.patternId})`} />
                      </svg>
                    </div>
                  )}

                  {/* Top Colored Accent Bar (if present) */}
                  {card.accentGradient && (
                    <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${card.accentGradient}`} />
                  )}

                  {/* Card Content */}
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      {card.icon ? (
                        <div className={`h-11 w-11 rounded-xl ${card.iconBg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                          {card.icon}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)] transition-transform group-hover:scale-125"
                            style={{ backgroundColor: card.patternStroke || '#10b981' }}
                          />
                        </div>
                      )}
                      <div className="h-8 w-8 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white group-hover:bg-white dark:group-hover:bg-slate-700 shadow-xs group-hover:shadow transition-all group-hover:translate-x-0.5">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {card.title}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                      {card.subtitle}
                    </p>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 dark:text-slate-500 font-medium">
                        {card.footerLeft}
                      </span>
                      {card.footerRight && (
                        <span className={card.footerRightBadge}>
                          {card.footerRight}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* ── DEDICATED MODULE VIEW PAGE (When inside any tab) ── */}
        {viewMode === 'list' && Boolean(activeTab) && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Navigation & Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div className="flex items-center gap-3.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => navigate('/inventory')}
                  className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-all cursor-pointer font-semibold text-xs shrink-0"
                  title="Return to Inventory Overview"
                >
                  <svg
                    className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-transform group-hover:-translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  
                </button>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                <div className="flex items-center gap-3">
                 
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {activeCard?.title || 'Module Details'}
                      </h1>
                      
                    </div>
                  
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {renderHeaderAction()}
              </div>
            </div>

            {/* Render Selected Module Page Component */}
            {activeTab === 'ingredients' && (
              <IngredientsPage
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
              <PurchaseOrdersPage
                purchaseOrders={purchaseOrders}
                loading={loading}
                onRefresh={loadAllData}
                onOpenCreate={() => setViewMode('create_po')}
              />
            )}

            {activeTab === 'recipes' && (
              <RecipesPage
                recipes={recipes}
                products={products}
                ingredients={ingredients}
                loading={loading}
                onRefresh={loadAllData}
                onOpenCreate={() => setViewMode('create_recipe')}
              />
            )}

            {activeTab === 'waste' && (
              <WastagePage
                wasteLogs={wasteLogs}
                ingredients={ingredients}
                loading={loading}
                onRefresh={loadAllData}
                onOpenCreate={() => setIsWasteModalOpen(true)}
              />
            )}

            {activeTab === 'suppliers' && (
              <SuppliersPage
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
              <StockLogsPage
                movementLogs={movementLogs}
                loading={loading}
                onRefresh={loadAllData}
              />
            )}
          </div>
        )}

        {/* ── VIEW MODE: Create / Edit Views ── */}
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

