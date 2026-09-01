import { useState, useMemo, useRef } from 'react'
import {
  Search,
  SlidersHorizontal,
  Flame,
  Plus,
  Minus,
  Sparkles,
  X
} from 'lucide-react'

export default function FoodScreen({
  categories = [],
  products = [],
  onQuickAdd,
  onOpenCustomizer,
  getProductCartQty,
  tableNum,
}) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('popular') // 'popular' | 'price_asc' | 'price_desc'
  const rightScrollRef = useRef(null)

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchCat =
          selectedCategory === 'all' || String(p.category_id) === String(selectedCategory)
        const matchSearch =
          !searchQuery ||
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchCat && matchSearch
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return parseFloat(a.price) - parseFloat(b.price)
        if (sortBy === 'price_desc') return parseFloat(b.price) - parseFloat(a.price)
        return b.id - a.id
      })
  }, [products, selectedCategory, searchQuery, sortBy])

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId)
    if (rightScrollRef.current) {
      rightScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#f5f6fa] overflow-hidden select-none">
      {/* ── Top Fixed Search Header ── */}
      <div className="bg-white border-b border-slate-100 px-3.5 py-2.5 shadow-xs shrink-0 z-20">
        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-slate-100 rounded-full px-3.5 py-1.5">
            <Search size={14} className="text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by dish name or ingredients..."
              className="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-transparent outline-none truncate"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-0.5 text-slate-400 cursor-pointer">
                <X size={13} />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-100 rounded-full px-3 py-1.5 text-xs font-bold text-slate-700 outline-none border-none cursor-pointer"
          >
            <option value="popular">Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* ── 2-Column Scrollable Body: Left Sidebar + Right Food Stream ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden pb-14">
        {/* ── Left Category Sidebar (Independently Scrollable) ── */}
        <div className="w-24 bg-white border-r border-slate-200/70 shrink-0 overflow-y-auto py-2 space-y-1 overscroll-contain">
          {/* All Dishes */}
          <button
            type="button"
            onClick={() => handleSelectCategory('all')}
            className={`w-full py-2.5 px-1 text-center text-xs font-bold transition-all relative flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 ${
              selectedCategory === 'all'
                ? 'text-[#ff2442] font-black bg-red-50/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {selectedCategory === 'all' && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-[#ff2442] rounded-r-full shadow-xs" />
            )}
            <div
              className={`w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center text-xl transition-all ${
                selectedCategory === 'all'
                  ? 'ring-2 ring-[#ff2442] shadow-sm scale-105 bg-gradient-to-tr from-amber-400 to-rose-500 text-white'
                  : 'border border-slate-200/80 bg-slate-100 text-slate-700'
              }`}
            >
              🔥
            </div>
            <span className="leading-tight text-[10px] font-bold">All Dishes</span>
            <span
              className={`text-[9px] font-mono leading-none ${
                selectedCategory === 'all' ? 'text-[#ff2442] font-bold' : 'text-slate-400'
              }`}
            >
              ({products.length})
            </span>
          </button>

          {/* Categories List with Category Images */}
          {categories.map((cat) => {
            const isSel = String(selectedCategory) === String(cat.id)
            const count = products.filter((p) => String(p.category_id) === String(cat.id)).length
            const catImage =
              cat.image_url ||
              products.find((p) => String(p.category_id) === String(cat.id) && p.image_url)?.image_url

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat.id)}
                className={`w-full py-2.5 px-1 text-center text-xs font-bold transition-all relative flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isSel
                    ? 'text-[#ff2442] font-black bg-red-50/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {isSel && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-[#ff2442] rounded-r-full shadow-xs" />
                )}

                {/* Category Main Image Thumbnail */}
                <div
                  className={`w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center transition-all bg-slate-100 ${
                    isSel
                      ? 'ring-2 ring-[#ff2442] shadow-sm scale-105 border border-transparent'
                      : 'border border-slate-200/80'
                  }`}
                >
                  {catImage ? (
                    <img
                      src={catImage}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <span className="text-lg">🍽️</span>
                  )}
                </div>

                <span className="leading-tight text-[10px] font-bold line-clamp-2 px-0.5">
                  {cat.name}
                </span>
                <span
                  className={`text-[9px] font-mono leading-none ${
                    isSel ? 'text-[#ff2442] font-bold' : 'text-slate-400'
                  }`}
                >
                  ({count})
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Right Dishes Stream (Independently Scrollable Card Stream) ── */}
        <div
          ref={rightScrollRef}
          className="flex-1 overflow-y-auto p-3 space-y-3 overscroll-contain pb-24"
        >
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs mt-4">
              <p className="font-bold text-xs text-slate-500">No dishes match this category</p>
              <p className="text-[10px] text-slate-400 mt-1">Try selecting another category on the left</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((prod) => {
                const inCartQty = getProductCartQty(prod.id)
                const hasOptions = prod.option_groups && prod.option_groups.length > 0
                const categoryObj = categories.find((c) => String(c.id) === String(prod.category_id))
                const categoryName = categoryObj?.name || 'Dish'

                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs flex flex-col transition-all hover:shadow-sm active:scale-[0.99] group"
                  >
                    {/* Top Figure / Image Box */}
                    <div
                      onClick={() => (hasOptions ? onOpenCustomizer(prod) : onQuickAdd(prod))}
                      className="w-full h-36 bg-gradient-to-tr from-slate-100 to-slate-50 relative overflow-hidden flex items-center justify-center cursor-pointer"
                    >
                      {prod.image_url ? (
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-2xl text-[#ff1837] bg-red-50">
                          {prod.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                     

                      
                    </div>

                    {/* Card Body */}
                    <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
                      <div>
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className="font-extrabold text-sm text-slate-900 truncate leading-tight">
                            {prod.name}
                          </h4>
                          
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {categoryName}
                        </p>
                       
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                            Price
                          </span>
                          <span className="font-mono font-black text-base text-[#ff1837]">
                            ${Number(prod.price).toFixed(2)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => (hasOptions ? onOpenCustomizer(prod) : onQuickAdd(prod))}
                          className="w-9 h-9 rounded-xl bg-[#ff1837] hover:bg-[#e01e38] text-white flex items-center justify-center shadow-md shadow-red-500/25 active:scale-75 hover:scale-105 transition-all duration-150 cursor-pointer relative group/btn"
                        >
                          <Plus size={17} className="stroke-[2.5] transition-transform group-active/btn:rotate-90" />
                          {inCartQty > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-slate-900 text-white rounded-full text-[9px] font-mono font-black shadow-xs ring-2 ring-white animate-in zoom-in-50">
                              {inCartQty}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
