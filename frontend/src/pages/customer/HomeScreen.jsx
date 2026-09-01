import {
  Utensils,
  FileSpreadsheet,
  Flame,
  Plus,
  ChevronRight,
  ArrowRight,
  BellRing
} from 'lucide-react'

export default function HomeScreen({
  session,
  tableNum = '8',
  orders = [],
  categories = [],
  products = [],
  searchQuery,
  setSearchQuery,
  language,
  setLanguage,
  selectedCategory,
  setSelectedCategory,
  onQuickAdd,
  onOpenCustomizer,
  getProductCartQty,
  onNavigateTab,
  onCallWaiterModal,
}) {
  const popularDishes = products.slice(0, 6)

  return (
    <div className="space-y-3.5 pb-20 pt-3 px-4 select-none">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 0. TOP BAR: RESTAURANT / POS NAME & TABLE NUMBER ONLY               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-3 px-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff1837] to-[#ff4757] text-white flex items-center justify-center font-black shrink-0 shadow-xs">
            <Utensils size={17} />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 tracking-tight leading-tight">
              
            </h1>
          
          </div>
        </div>

        {/* Right: Table Number & Quick Call Staff */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-red-50 text-[#ff1837] border border-red-200/80 flex items-center gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-red-400">Table</span>
            <span className="text-sm font-black text-[#ff1837]">#{tableNum}</span>
          </div>

          <button
            type="button"
            onClick={onCallWaiterModal}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="Call Staff / Waiter"
          >
            <BellRing size={14} className="text-[#ff1837]" />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. FOOD MENU & LIVE ORDER NAVIGATION CARDS                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Food Menu Link */}
        <div
          onClick={() => onNavigateTab?.('food')}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-[#ff1837] text-white p-4 shadow-lg shadow-red-500/20 cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-95"
        >
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-md" />
          <div className="flex flex-col justify-between h-28 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner">
              <Utensils size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-red-100 uppercase tracking-wide">Food Catalog</p>
              <h3 className="text-sm font-black text-white flex items-center justify-between mt-0.5">
                <span>Browse Menu</span>
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
              </h3>
            </div>
          </div>
        </div>

        {/* Card 2: Track Orders Link */}
        <div
          onClick={() => onNavigateTab?.('order')}
          className="group relative overflow-hidden rounded-2xl bg-white text-slate-900 p-4 border border-slate-100 shadow-sm cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-95"
        >
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-amber-500/10 rounded-full blur-md" />
          <div className="flex flex-col justify-between h-28 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Order Status</p>
              <h3 className="text-sm font-black text-slate-800 flex items-center justify-between mt-0.5">
                <span>View Orders</span>
                <ChevronRight size={16} className="text-slate-400 transition-transform group-hover:translate-x-1" />
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 3. POPULAR & RECOMMENDED FOOD (Click link to Order / Food Menu)     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
            <Flame size={16} className="text-[#ff1837]" />
            <span>Chef's Recommendations</span>
          </h3>
          <button
            type="button"
            onClick={() => onNavigateTab?.('food')}
            className="text-xs font-bold text-[#ff1837] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>See All</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="space-y-2.5">
          {popularDishes.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs">
              <p className="font-bold text-xs text-slate-500">Menu loading or empty...</p>
            </div>
          ) : (
            popularDishes.map((prod) => {
              const inCartQty = getProductCartQty(prod.id)
              const hasOptions = prod.option_groups && prod.option_groups.length > 0

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex items-center gap-3 transition-transform hover:scale-[1.01]"
                >
                  {/* Dish Thumbnail */}
                  <div
                    onClick={() => hasOptions ? onOpenCustomizer(prod) : onQuickAdd(prod)}
                    className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0 relative cursor-pointer"
                  >
                    {prod.image_url ? (
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-xs text-[#ff1837] bg-red-50">
                        {prod.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    {hasOptions && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[8px] font-bold text-white">
                        Custom
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div
                    onClick={() => hasOptions ? onOpenCustomizer(prod) : onQuickAdd(prod)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <h4 className="font-extrabold text-xs text-slate-900 truncate">{prod.name}</h4>
                    {prod.description && (
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{prod.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-mono font-black text-sm text-[#ff1837]">
                        ${Number(prod.price).toFixed(2)}
                      </span>
                      {Number(prod.price) > 10 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-700">
                          Popular
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add / Stepper */}
                  <div className="shrink-0">
                    {hasOptions ? (
                      <button
                        type="button"
                        onClick={() => onOpenCustomizer(prod)}
                        className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-[#ff1837] font-bold text-[11px] border border-red-200 flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Plus size={12} />
                        <span>{inCartQty > 0 ? `(${inCartQty})` : 'Add'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onQuickAdd(prod)}
                        className="w-8 h-8 rounded-xl bg-[#ff1837] hover:bg-[#e01e38] flex items-center justify-center text-white shadow-sm shadow-red-500/25 active:scale-90 cursor-pointer"
                      >
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Big Bottom Action to Food Menu */}
        <button
          type="button"
          onClick={() => onNavigateTab?.('food')}
          className="w-full py-3.5 mt-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Utensils size={15} className="text-[#ff1837]" />
          <span>Open Full Food & Drink Menu</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
