import { useState, useEffect, useRef, useMemo } from 'react'
import { Scrollspy } from '../../../components/reui/scrollspy'
import {
  X,
  Image as ImageIcon,
  Plus,
  Trash2,
  Check,
  Percent,
  DollarSign,
  Clock,
  Utensils,
  Layers,
  Sparkles,
  Tag,
  ArrowLeft,
  Loader2,
  Infinity as InfinityIcon,
  Package
} from 'lucide-react'
import toast from 'react-hot-toast'
import axiosClient from '../../../api/axiosClient'
import { adminApi } from '../../../api/adminApi'
import { Button } from '../../../components/common/ButtonComponent'
import { SearchSelection } from '../../../components/plugin/components/Search-Selection-components'

function CreateSubCatModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="rounded-[5px] shadow-xl w-full max-w-sm overflow-hidden border animate-in zoom-in-95 duration-150"
        style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h3 className="font-extrabold text-base" style={{ color: 'var(--color-text)' }}>
            New Sub-Category
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) return
            onSave(name.trim())
            setName('')
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
              Sub-Category Name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-medium transition-colors"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
              placeholder="e.g."
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-[5px] text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))',
            }}
          >
            Save Sub-Category
          </button>
        </form>
      </div>
    </div>
  )
}

function CreateAddonModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [groupName, setGroupName] = useState('Add-ons')
  const [type, setType] = useState('multiple')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="rounded-[5px] shadow-xl w-full max-w-md overflow-hidden border animate-in zoom-in-95 duration-150"
        style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h3 className="font-extrabold text-base" style={{ color: 'var(--color-text)' }}>
            Quick Create Add-on
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) return
            onSave({
              name: name.trim(),
              price: parseFloat(price) || 0,
              group_name: groupName.trim() || 'Add-ons',
              type
            })
            setName('')
            setPrice('')
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
              Add-on Name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-[5px] border outline-none font-medium"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
              placeholder="e.g."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                Extra Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-[5px] border outline-none font-mono font-bold"
                style={{
                  background: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                Modifier Group
              </label>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-[5px] border outline-none font-medium"
                style={{
                  background: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
                placeholder="Add-ons / Topping"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-[5px] text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))',
            }}
          >
            Create & Link Add-on
          </button>
        </form>
      </div>
    </div>
  )
}

function QuickAddOptionModal({ isOpen, group, onClose, onSave }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  if (!isOpen || !group) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="rounded-[5px] shadow-xl w-full max-w-md overflow-hidden border animate-in zoom-in-95 duration-150"
        style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <h3 className="font-extrabold text-base" style={{ color: 'var(--color-text)' }}>
              Add Option Choice
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
              Adding a choice to &ldquo;{group.name}&rdquo;
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) return
            onSave(group.id, {
              name: name.trim(),
              price: parseFloat(price) || 0,
            })
            setName('')
            setPrice('')
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--color-muted)' }}
            >
              Choice / Option Name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-[5px] border outline-none font-semibold"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
              placeholder="e.g."
            />
          </div>

          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--color-muted)' }}
            >
              Additional Price ($)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-mono">
                +$
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2 text-xs rounded-[5px] border outline-none font-mono font-bold"
                style={{
                  background: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
                placeholder="0.00"
              />
            </div>
            <span className="text-[10px] mt-1 block" style={{ color: 'var(--color-muted)' }}>
              Enter 0.00 for free / standard options.
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-[5px] text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))',
              }}
            >
              + Add Choice to {group.name}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const STATION_OPTIONS = ['Station', 'Bar', 'Bakery', 'Grill', 'Salad Bar', 'Dessert Station']

export default function MenuitemCreateView({ onClose, onSave, item, categories = [] }) {
  const [outlets, setOutlets] = useState([])
  const [stations, setStations] = useState([])
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    outlet_id: null,
    station_id: '',
    barcode: '',
    category_id: '',
    sub_category: '',
    sku: '',
    price: '',
    cost_price: '',
    discount_type: 'percentage',
    discount_value: 0,
    discount_pct: 0,
    image_products_id: null,
    image_url: '',
    is_available: true,
    is_featured: false,
    stock_quantity: 0,
    low_stock_threshold: 5,
    track_stock: false,
    is_unlimited: true,
    kitchen_station: 'Kitchen',
    prep_time_mins: 15,
    description: '',
    option_group_ids: [],
    sizes: [],
  })

  const parentRef = useRef(null)
  const [optionGroupsList, setOptionGroupsList] = useState([])
  const [addonModalOpen, setAddonModalOpen] = useState(false)
  const [subCatModalOpen, setSubCatModalOpen] = useState(false)
  const [quickAddChoiceGroup, setQuickAddChoiceGroup] = useState(null)
  const [localCategories, setLocalCategories] = useState(categories)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [activeAddonCat, setActiveAddonCat] = useState('all')

  // Fetch categories specifically for the selected outlet
  const fetchCategoriesForOutlet = async (outletId) => {
    if (!outletId) {
      setLocalCategories([])
      return
    }
    setLoadingCategories(true)
    try {
      const res = await adminApi.getCategories({ outlet_id: String(outletId), limit: 200 })
      const data = res.data?.data || []
      setLocalCategories(data)
    } catch (err) {
      console.error('Failed to load categories for outlet:', err)
      setLocalCategories([])
    } finally {
      setLoadingCategories(false)
    }
  }

  // Fetch stations for the selected outlet
  const fetchStationsForOutlet = async (outletId) => {
    try {
      const res = await adminApi.getStations(outletId ? { outlet_id: String(outletId) } : {})
      setStations(res.data?.data || [])
    } catch (err) {
      console.warn('Failed to load stations:', err)
      setStations([])
    }
  }

  // Handle Outlet change: drop category/sub-category/station and load outlet's categories & stations
  const handleOutletChange = async (newOutletId) => {
    const nextOutlet = String(newOutletId || '')
    // 1. Drop previously selected category, sub-category, and station
    setFormData((prev) => ({
      ...prev,
      outlet_id: nextOutlet || null,
      category_id: '',
      sub_category_id: '',
      sub_category: '',
      station_id: '',
    }))

    // 2. Fetch categories & stations for newly selected venue
    await Promise.all([
      fetchCategoriesForOutlet(nextOutlet),
      fetchStationsForOutlet(nextOutlet)
    ])
  }

  useEffect(() => {
    const targetOutlet = item?.outlet_id ? String(item.outlet_id) : ''
    fetchCategoriesForOutlet(targetOutlet)
    fetchStationsForOutlet(targetOutlet)
  }, [item?.outlet_id])

  useEffect(() => {
    axiosClient.get('/outlets').then((res) => setOutlets(res.data?.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    adminApi.getOptionGroups()
      .then(({ data }) => {
        setOptionGroupsList(data.data || [])
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (item) {
      const selectedOptionGroupIDs = (item.option_groups || []).map((og) => og.id)
      const allCats = localCategories.length > 0 ? localCategories : (categories || [])
      const itemCat = item.category || allCats.find((c) => String(c.id) === String(item.category_id))
      const isSub = Boolean(itemCat?.parent_id)
      const mainCatId = isSub ? String(itemCat.parent_id) : (item.category_id ? String(item.category_id) : '')
      const subCatId = isSub ? String(item.category_id) : ''

      setFormData({
        id: item.id || '',
        name: item.name || item.title || '',
        outlet_id: item.outlet_id ? String(item.outlet_id) : null,
        station_id: item.station_id ? String(item.station_id) : '',
        barcode: item.barcode || '',
        category_id: mainCatId,
        sub_category_id: subCatId,
        sub_category: subCatId,
        sku: item.sku || '',
        price: item.price ?? '',
        cost_price: item.cost_price ?? '',
        discount_type: item.discount_type || 'percentage',
        discount_value: item.discount_value ?? 0,
        discount_pct: item.discount_pct ?? 0,
        image_products_id: item.image_products_id ?? null,
        image_url: item.image_url || '',
        is_available: item.is_available !== false,
        is_featured: item.is_featured || false,
        stock_quantity: item.stock_quantity ?? item.stock ?? 0,
        low_stock_threshold: item.low_stock_threshold ?? 5,
        track_stock: item.is_unlimited !== undefined ? !item.is_unlimited : (item.track_stock ?? false),
        is_unlimited: item.is_unlimited !== undefined ? Boolean(item.is_unlimited) : (item.track_stock !== undefined ? !item.track_stock : true),
        kitchen_station: item.kitchen_station || 'Kitchen',
        prep_time_mins: item.prep_time_mins ?? 15,
        description: item.description || '',
        option_group_ids: selectedOptionGroupIDs,
        sizes: Array.isArray(item.sizes) ? item.sizes : [],
      })
    } else {
      const randomSku = Math.floor(100000000000 + Math.random() * 900000000000).toString()
      setFormData({
        id: '',
        name: '',
        outlet_id: null,
        station_id: '',
        barcode: '',
        category_id: '',
        sub_category_id: '',
        sub_category: '',
        sku: randomSku,
        price: '',
        cost_price: '',
        discount_type: 'percentage',
        discount_value: 0,
        discount_pct: 0,
        image_products_id: null,
        image_url: '',
        is_available: true,
        is_featured: false,
        stock_quantity: 0,
        low_stock_threshold: 5,
        track_stock: false,
        is_unlimited: true,
        kitchen_station: 'Kitchen',
        prep_time_mins: 15,
        description: '',
        option_group_ids: [],
        sizes: [],
      })
    }
  }, [item?.id])

  // If localCategories loaded after initial item setup, ensure parent/sub are synchronized
  useEffect(() => {
    if (item?.category_id && localCategories.length > 0) {
      const itemCat = item.category || localCategories.find((c) => String(c.id) === String(item.category_id))
      if (itemCat?.parent_id) {
        setFormData((prev) => {
          if (prev.category_id === String(itemCat.parent_id) && prev.sub_category_id === String(item.category_id)) {
            return prev
          }
          if (!prev.sub_category_id && (!prev.category_id || prev.category_id === String(item.category_id))) {
            return {
              ...prev,
              category_id: String(itemCat.parent_id),
              sub_category_id: String(item.category_id),
              sub_category: String(item.category_id),
            }
          }
          return prev
        })
      }
    }
  }, [item?.id, item?.category_id, localCategories])

  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const setField = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }))

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 1. Show immediate local preview
    const reader = new FileReader()
    reader.onload = () => {
      setField('image_url', reader.result)
    }
    reader.readAsDataURL(file)

    // 2. Upload to server storage
    const form = new FormData()
    form.append('image', file)
    setIsUploadingImage(true)
    try {
      const { data } = await adminApi.uploadImage(form, 'products')
      const uploadedUrl = data?.url || data?.path
      const mediaId = data?.media_id || data?.id || null
      if (uploadedUrl) {
        setField('image_url', uploadedUrl)
        if (mediaId) {
          setField('image_products_id', mediaId)
        }
        toast.success('Image uploaded successfully')
      }
    } catch (err) {
      console.warn('File upload to server endpoint failed; preserved base64:', err)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleQuickAddChoiceToGroup = async (groupId, choiceData) => {
    const targetGroup = optionGroupsList.find((g) => g.id === groupId)
    if (!targetGroup) return

    const updatedValues = [
      ...existingValues.map((v) => ({
        name: v.name,
        price: v.price || 0,
        stock_quantity: v.stock_quantity || 0,
        is_unlimited: v.is_unlimited !== undefined ? Boolean(v.is_unlimited) : true,
      })),
      {
        name: choiceData.name,
        price: choiceData.price || 0,
        stock_quantity: 0,
        is_unlimited: true,
      },
    ]

    const payload = {
      name: targetGroup.name,
      type: targetGroup.type,
      is_required: Boolean(targetGroup.is_required),
      values: updatedValues,
    }

    try {
      await adminApi.updateOptionGroup(groupId, payload)
      const { data } = await adminApi.getOptionGroups()
      setOptionGroupsList(data.data || [])
      setQuickAddChoiceGroup(null)
      toast.success(`Choice "${choiceData.name}" added to ${targetGroup.name}`)
    } catch (err) {
      toast.error('Failed to add choice to option group')
    }
  }

  const handleCreateAddonGroup = async (addonData) => {
    try {
      const payload = {
        outlet_id: formData.outlet_id || null,
        name: addonData.group_name || addonData.name,
        type: addonData.type || 'multiple',
        is_required: false,
        values: [
          {
            name: addonData.name,
            price: parseFloat(addonData.price) || 0
          }
        ]
      }
      const { data } = await adminApi.createOptionGroup(payload)
      const newGroup = data.data || data
      setOptionGroupsList((prev) => [...prev, newGroup])
      if (newGroup?.id) {
        setField('option_group_ids', [...formData.option_group_ids, newGroup.id])
      }
      setAddonModalOpen(false)
      toast.success('Option group created')
    } catch (err) {
      toast.error('Failed to create addon group')
    }
  }

  const handleCreateSubCat = async (newSubCat) => {
    if (!formData.category_id) {
      toast.error('Please select a main category first')
      return
    }
    try {
      const res = await adminApi.createCategory({
        name: newSubCat,
        parent_id: formData.category_id,
        outlet_id: formData.outlet_id || null,
        is_active: true,
      })
      const newCat = res.data?.data || res.data
      if (newCat?.id) {
        setLocalCategories((prev) => [...prev, newCat])
        setField('sub_category_id', String(newCat.id))
        setField('sub_category', String(newCat.id))
        toast.success(`Sub-category "${newSubCat}" created`)
      }
    } catch (err) {
      console.error('Failed to create sub-category:', err)
      toast.error('Failed to create sub-category')
    }
    setSubCatModalOpen(false)
  }

  const handleSubmit = (e) => {
    e?.preventDefault?.()
    if (!formData.name.trim()) {
      toast.error('Product name is required')
      const el = document.getElementById('basic')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      toast.error('Valid selling price is required')
      const el = document.getElementById('pricing')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    const finalCategoryId = formData.sub_category_id || formData.category_id
    if (!finalCategoryId) {
      toast.error('Please select a category')
      const el = document.getElementById('basic')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    const payload = {
      name: formData.name.trim(),
      category_id: finalCategoryId,
      outlet_id: formData.outlet_id || null,
      station_id: formData.station_id || null,
      barcode: formData.barcode ? formData.barcode.trim() : null,
      description: formData.description ? formData.description.trim() : null,
      price: parseFloat(formData.price) || 0,
      cost_price: parseFloat(formData.cost_price) || 0,
      discount_type: formData.discount_type || 'percentage',
      discount_value: parseFloat(formData.discount_value) || 0,
      discount_pct: parseFloat(formData.discount_pct) || 0,
      stock_quantity: formData.is_unlimited ? 0 : (parseInt(formData.stock_quantity) || 0),
      low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
      track_stock: !Boolean(formData.is_unlimited),
      is_unlimited: Boolean(formData.is_unlimited),
      is_available: formData.is_available !== undefined ? Boolean(formData.is_available) : true,
      is_featured: Boolean(formData.is_featured),
      kitchen_station: formData.kitchen_station || 'Kitchen',
      prep_time_mins: parseInt(formData.prep_time_mins) || 15,
      image_products_id: formData.image_products_id || null,
      image_url: formData.image_url || null,
      option_group_ids: Array.isArray(formData.option_group_ids) ? formData.option_group_ids.filter(Boolean) : []
    }

    onSave(payload)
  }

  const tabs = [
    { id: 'venue', label: 'Venue & Outlet' },
    { id: 'basic', label: 'Basic Info' },
    { id: 'pricing', label: 'Pricing & Variants' },
    { id: 'Station', label: 'Station Settings' },
    { id: 'addons', label: 'Add-ons' },
  ]

  // Station options for SearchSelection
  const stationOptions = useMemo(() => {
    if (!stations || stations.length === 0) {
      return [
        { id: '1', value: '1', name: 'Kitchen (KDS)', label: 'Kitchen (KDS)', badge: 'KDS' },
        { id: '2', value: '2', name: 'Bar Counter', label: 'Bar Counter', badge: 'BAR' },
        { id: '3', value: '3', name: 'Bakery / Pastry', label: 'Bakery / Pastry', badge: 'BAKERY' },
        { id: '4', value: '4', name: 'Grill Station', label: 'Grill Station', badge: 'GRILL' },
      ]
    }
    return stations.map((s) => ({
      id: String(s.id),
      value: String(s.id),
      name: s.name,
      label: s.name,
      badge: (s.type || 'KDS').toUpperCase(),
      description: s.ip_address ? `IP: ${s.ip_address}` : 'Prep Station',
    }))
  }, [stations])

  // Outlet / Venue options with badges and flags for SearchSelection
  const outletOptions = useMemo(() => {
    return outlets.map((o) => ({
      value: String(o.id),
      id: String(o.id),
      label: o.name,
      name: o.name,
      badge: o.code,
      
      description:
        o.type === 'cafe'
          ? 'Cafe & Bakery'
          : o.type === 'bar'
          ? 'SkyBar & Lounge'
          : o.type === 'retail'
          ? 'Supermarket / Mart'
          : 'Grand Restaurant',
    }))
  }, [outlets])

  // Main categories (categories without a parent_id), with sub-category count badge
  const mainCategories = useMemo(() => {
    // 1. Build map of parent_id -> sub-category count
    const subCountMap = {}
    localCategories.forEach((c) => {
      if (c.parent_id) {
        const pid = String(c.parent_id)
        subCountMap[pid] = (subCountMap[pid] || 0) + 1
      }
    })

    const list = localCategories.filter((c) => !c.parent_id)
    const baseList = list.length > 0 ? list : localCategories

    return baseList.map((cat) => {
      const catId = String(cat.id)
      let count = subCountMap[catId] || 0
      if (Array.isArray(cat.sub_categories)) {
        count += cat.sub_categories.length
      }

      return {
        ...cat,
        badge: count > 0 ? `${count} sub` : '0 sub',
        sub_count: count,
      }
    })
  }, [localCategories])

  // Available sub-categories derived strictly from selected Main Category (main -> sub)
  const availableSubCategories = useMemo(() => {
    if (!formData.category_id) return []

    const list = []
    const seen = new Set()
    const selectedCatId = String(formData.category_id)

    // 1. Direct sub-categories in localCategories where parent_id matches selected Main Category
    localCategories.forEach((cat) => {
      if (cat.parent_id && String(cat.parent_id) === selectedCatId) {
        const idStr = String(cat.id)
        if (!seen.has(idStr)) {
          seen.add(idStr)
          list.push({
            id: idStr,
            value: idStr,
            name: cat.name,
            label: cat.name,
            image: cat.image_url,
            badge: 'Sub-Category',
          })
        }
      }
    })

    return list
  }, [localCategories, formData.category_id])

  // Calculate profit margin
  const sellingPrice = parseFloat(formData.price) || 0
  const costPrice = parseFloat(formData.cost_price) || 0
  const profit = sellingPrice - costPrice
  const profitMarginPct = sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(1) : '0.0'

  return (
    <div className=" mx-auto w-full pb-10 select-none animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="secondary"
          size="md"
          onClick={onClose}
          iconLeading={ArrowLeft}
        >
          Cancel & Return
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          iconLeading={Check}
          className="shadow-sm"
        >
          {item ? 'Save Changes' : 'Save Product'}
        </Button>
      </div>

      {/* Main Form Container */}
      <div
        className="rounded-[5px] border overflow-hidden shadow-xs"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Header */}
        <div
          className="px-8 py-6 border-b flex items-center justify-between shrink-0"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div>
            <h3 className="font-extrabold text-xl sm:text-2xl" style={{ color: 'var(--color-text)' }}>
              {item ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Fill out the details below to define your menu item.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Vertical Tab bar */}
          <div
            className="w-full md:w-56 border-b md:border-b-0 md:border-r shrink-0 p-5"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-surface)',
            }}
          >
            <Scrollspy
              offset={30}
              targetRef={parentRef}
              className="flex flex-row md:flex-col gap-2.5 overflow-x-auto scrollbar-none"
            >
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  data-scrollspy-anchor={t.id}
                  className="inline-flex items-center justify-start whitespace-nowrap rounded-[5px] text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50 h-10 px-4 py-2 text-slate-700 dark:text-slate-300 data-[active=true]:bg-slate-900 data-[active=true]:text-white data-[active=true]:border-slate-900 dark:data-[active=true]:bg-slate-50 dark:data-[active=true]:text-slate-900 dark:data-[active=true]:border-slate-50 shadow-2xs"
                >
                  {t.label}
                </button>
              ))}
            </Scrollspy>
          </div>

          {/* Form Body */}
          <div ref={parentRef} className="flex-1 overflow-y-auto max-h-[75vh] scroll-smooth p-5 relative scrollbar-none">
            <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
              {/* ── TAB 1: Venue & Outlet Selection ──────────────────────────── */}
              <div id="venue" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Venue and Outlet
                </h3>
                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-4"
                  style={{
                    background: 'var(--color-surface)',
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Venue / Outlet *
                      </label>
                      <SearchSelection
                        name="outlet_id"
                        options={outletOptions}
                        valueKey="id"
                        labelKey="name"
                        value={String(formData.outlet_id || '')}
                        autoSelect={false}
                        onChange={(val) => handleOutletChange(val)}
                        placeholder="Select Venue"
                        searchPlaceholder="..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Barcode / SKU (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Scan or type barcode"
                        value={formData.barcode}
                        onChange={(e) => setField('barcode', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-[5px] border outline-none font-mono font-bold transition-all"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── TAB 2: Basic Info ──────────────────────────── */}
              <div id="basic" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Basic Info
                </h3>
                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-6"
                  style={{
                    background: 'var(--color-surface)',
                  }}
                >
                  {/* Image Upload & Title */}
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    {/* Image Box */}
                    <div
                      className="w-32 h-32 rounded-[5px] border-2 border-dashed flex flex-col items-center justify-center shrink-0 overflow-hidden relative group transition-colors"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      {isUploadingImage && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />
                          <span className="text-[10px] font-bold">Uploading...</span>
                        </div>
                      )}
                      {formData.image_url ? (
                        <>
                          <img
                            src={formData.image_url}
                            alt="preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setField('image_url', '')}
                              className="w-9 h-9 rounded-[5px] bg-white text-rose-600 flex items-center justify-center hover:bg-rose-50 shadow-sm transition-transform active:scale-90"
                              title="Remove Photo"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon size={32} style={{ color: 'var(--color-muted)' }} />
                          <span className="text-[11px] font-bold mt-2" style={{ color: 'var(--color-muted)' }}>
                            Upload Photo
                          </span>
                        </>
                      )}
                      {!formData.image_url && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFile}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          title="Upload Image File"
                        />
                      )}
                    </div>

                    {/* Title & Category / Sub-Category */}
                    <div className="flex-1 w-full space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                          Product Title *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g."
                          value={formData.name}
                          onChange={(e) => setField('name', e.target.value)}
                          className="w-full px-4 py-2.5 text-xs rounded-[5px] border outline-none font-bold transition-all"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                              Category *
                            </label>
                            {loadingCategories && (
                              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#126973] dark:text-[#F1D8C2] animate-pulse">
                                <Loader2 size={11} className="animate-spin" />
                                <span>Loading venue categories...</span>
                              </span>
                            )}
                          </div>
                          <SearchSelection
                            name="category_id"
                            options={mainCategories}
                            valueKey="id"
                            labelKey="name"
                            value={formData.category_id}
                            autoSelect={false}
                            disabled={loadingCategories || !formData.outlet_id}
                            onChange={(val) => {
                              setField('category_id', val)
                              setField('sub_category_id', '')
                              setField('sub_category', '')
                            }}
                            placeholder={
                              loadingCategories
                                ? 'Loading...'
                                : !formData.outlet_id
                                ? 'Select venue first'
                                : mainCategories.length === 0
                                ? 'No categories available'
                                : 'Select category'
                            }
                            searchPlaceholder="Search categories..."
                            emptyMessage={
                              loadingCategories
                                ? 'Loading...'
                                : !formData.outlet_id
                                ? 'Select venue first'
                                : 'No categories found'
                            }
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                              Sub-Category
                            </label>
                            {formData.category_id && !loadingCategories && (
                              <button
                                type="button"
                                onClick={() => setSubCatModalOpen(true)}
                                className="text-[11px] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                                style={{ color: 'var(--color-500, #BF4040)' }}
                              >
                                <Plus size={11} /> New
                              </button>
                            )}
                          </div>
                          <SearchSelection
                            name="sub_category_id"
                            options={availableSubCategories}
                            valueKey="id"
                            labelKey="name"
                            value={formData.sub_category_id || formData.sub_category || ''}
                            onChange={(val) => {
                              setField('sub_category_id', val)
                              setField('sub_category', val)
                            }}
                            disabled={loadingCategories || !formData.category_id}
                            allowCreate={Boolean(formData.category_id && !loadingCategories)}
                            onCreate={(newVal) => handleCreateSubCat(newVal)}
                            placeholder={
                              loadingCategories
                                ? 'Loading...'
                                : !formData.category_id
                                ? 'Select main category first'
                                : availableSubCategories.length === 0
                                ? 'No sub-categories (Optional)'
                                : 'Select sub-category (Optional)'
                            }
                            searchPlaceholder="Search sub-categories..."
                            emptyMessage={
                              loadingCategories
                                ? 'Loading...'  
                                : !formData.category_id
                                ? 'Select main category first'
                                : 'No sub-category found'
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                      Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="..."
                      value={formData.description}
                      onChange={(e) => setField('description', e.target.value)}
                      className="w-full px-4 py-2.5 text-xs rounded-[5px] border outline-none resize-none leading-relaxed"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                  </div>

                  {/* Checkboxes */}
                  <div
                    className="flex flex-col sm:flex-row sm:items-center gap-6 pt-4 border-t"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.is_available}
                        onChange={(e) => setField('is_available', e.target.checked)}
                        className="w-4 h-4 rounded-[5px] accent-[#BF4040]"
                      />
                      <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                        Available
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setField('is_featured', e.target.checked)}
                        className="w-4 h-4 rounded-[5px] accent-[#BF4040]"
                      />
                      <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                        Featured
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ── TAB 2: Pricing, Stock & Variants ─────────────────────── */}
              <div id="pricing" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Pricing &amp; Variants
                </h3>
                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-6"
                  style={{
                    background: 'var(--color-surface)',
                  }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Base Price ($) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => setField('price', e.target.value)}
                        className="w-full px-4 py-2.5 text-sm rounded-[5px] border outline-none font-mono font-bold"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Cost Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.cost_price}
                        onChange={(e) => setField('cost_price', e.target.value)}
                        className="w-full px-4 py-2.5 text-sm rounded-[5px] border outline-none font-mono"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-secondary)',
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                        Discount
                      </label>
                      <div className="inline-flex rounded-[5px] p-0.5 border" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                        <button
                          type="button"
                          onClick={() => setField('discount_type', 'percentage')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-[4px] transition-all ${
                            (formData.discount_type || 'percentage') === 'percentage'
                              ? 'bg-[#126973] text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          % Percentage
                        </button>
                        <button
                          type="button"
                          onClick={() => setField('discount_type', 'fixed')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-[4px] transition-all ${
                            formData.discount_type === 'fixed'
                              ? 'bg-[#126973] text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          $ Fixed Amount
                        </button>
                      </div>
                    </div>

                    {formData.discount_type === 'fixed' ? (
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.discount_value}
                          onChange={(e) => setField('discount_value', e.target.value)}
                          className="w-full pl-8 pr-4 py-2.5 text-xs rounded-[5px] border outline-none font-mono font-bold"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          placeholder="0"
                          value={formData.discount_pct}
                          onChange={(e) => setField('discount_pct', e.target.value)}
                          className="w-full pr-8 pl-4 py-2.5 text-xs rounded-[5px] border outline-none font-mono font-bold"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)',
                          }}
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                          %
                        </span>
                      </div>
                    )}

                    {/* Live Effective Price Preview */}
                    {sellingPrice > 0 && (
                      <div className="text-[11px] font-medium flex items-center gap-2 pt-1" style={{ color: 'var(--color-muted)' }}>
                        <span>Effective Price:</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ${(
                            formData.discount_type === 'fixed'
                              ? Math.max(0, sellingPrice - (parseFloat(formData.discount_value) || 0))
                              : sellingPrice * (1 - (parseFloat(formData.discount_pct) || 0) / 100)
                          ).toFixed(2)}
                        </span>
                        {(formData.discount_type === 'fixed' ? parseFloat(formData.discount_value) > 0 : parseFloat(formData.discount_pct) > 0) && (
                          <span className="line-through text-slate-400 font-mono">
                            ${sellingPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stock Policy: Unlimited vs Tracked */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                        Stock Tracking Policy
                      </label>
                      <span className="text-[11px] font-semibold" style={{ color: formData.is_unlimited ? 'var(--color-500, #126973)' : 'var(--color-text)' }}>
                        {formData.is_unlimited ? '∞ Unlimited Stock' : '📦 Tracked Stock'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            is_unlimited: true,
                            track_stock: false,
                          }))
                        }}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          formData.is_unlimited
                            ? 'ring-2 ring-[var(--color-500,#126973)] bg-[var(--color-500,#126973)]/10 border-[var(--color-500,#126973)]'
                            : 'hover:bg-black/5 dark:hover:bg-white/5 border-[var(--color-border)]'
                        }`}
                        style={{
                          background: formData.is_unlimited ? 'rgba(18, 105, 115, 0.08)' : 'var(--color-bg)',
                        }}
                      >
                        <div
                          className="p-2 rounded-lg shrink-0 mt-0.5"
                          style={{
                            background: formData.is_unlimited ? 'var(--color-500, #126973)' : 'rgba(255, 255, 255, 0.08)',
                            color: formData.is_unlimited ? '#ffffff' : 'var(--color-muted)',
                          }}
                        >
                          <InfinityIcon size={18} strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                              Unlimited Stock
                            </p>
                            {formData.is_unlimited && (
                              <span className="w-2 h-2 rounded-full bg-[var(--color-500,#126973)]" />
                            )}
                          </div>
                          <p className="text-[11px] mt-0.5 leading-snug" style={{ color: 'var(--color-muted)' }}>
                            Always available, no stock tracking
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            is_unlimited: false,
                            track_stock: true,
                          }))
                        }}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          !formData.is_unlimited
                            ? 'ring-2 ring-[var(--color-500,#126973)] bg-[var(--color-500,#126973)]/10 border-[var(--color-500,#126973)]'
                            : 'hover:bg-black/5 dark:hover:bg-white/5 border-[var(--color-border)]'
                        }`}
                        style={{
                          background: !formData.is_unlimited ? 'rgba(18, 105, 115, 0.08)' : 'var(--color-bg)',
                        }}
                      >
                        <div
                          className="p-2 rounded-lg shrink-0 mt-0.5"
                          style={{
                            background: !formData.is_unlimited ? 'var(--color-500, #126973)' : 'rgba(255, 255, 255, 0.08)',
                            color: !formData.is_unlimited ? '#ffffff' : 'var(--color-muted)',
                          }}
                        >
                          <Package size={18} strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                              Tracked Stock
                            </p>
                            {!formData.is_unlimited && (
                              <span className="w-2 h-2 rounded-full bg-[var(--color-500,#126973)]" />
                            )}
                          </div>
                          <p className="text-[11px] mt-0.5 leading-snug" style={{ color: 'var(--color-muted)' }}>
                            Track quantity & alert when low
                          </p>
                        </div>
                      </button>
                    </div>

                    {/* Conditional Info / Inputs */}
                    {formData.is_unlimited ? (
                      <div
                        className="p-3.5 rounded-xl border border-dashed flex items-center gap-3 text-xs"
                        style={{
                          borderColor: 'var(--color-border)',
                          background: 'rgba(255, 255, 255, 0.02)',
                        }}
                      >
                        <span className="text-lg leading-none">ℹ️</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--color-text)]">
                            This product is set to Unlimited Stock
                          </p>
                          <p className="text-[11px] text-[var(--color-muted)] mt-0.5">
                            Inventory will not be tracked or restricted (ideal for made-to-order dishes, beverages, or services).
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-150">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                            Current Stock
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.stock_quantity}
                            onChange={(e) => setField('stock_quantity', e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-2.5 text-xs rounded-[5px] border outline-none font-mono font-bold"
                            style={{
                              background: 'var(--color-bg)',
                              borderColor: 'var(--color-border)',
                              color: 'var(--color-text)',
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                            Low Stock Alert
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.low_stock_threshold}
                            onChange={(e) => setField('low_stock_threshold', e.target.value)}
                            placeholder="5"
                            className="w-full px-4 py-2.5 text-xs rounded-[5px] border outline-none font-mono"
                            style={{
                              background: 'var(--color-bg)',
                              borderColor: 'var(--color-border)',
                              color: 'var(--color-text)',
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profit Margin Indicator */}
                  {sellingPrice > 0 && costPrice > 0 && (
                    <div className="p-4 bg-emerald-500/10 rounded-[5px] border border-emerald-500/20 flex items-center justify-between text-xs">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        Estimated Profit Margin
                      </span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                        {profitMarginPct}% &nbsp;(+${profit.toFixed(2)})
                      </span>
                    </div>
                  )}

                  <div className="h-px border-t my-6" style={{ borderColor: 'var(--color-border)' }} />

                  {/* Sizes & Variants Repeater */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>
                          Sizes &amp; Variants
                        </label>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-muted)' }}>
                          Add different sizes or variations that affect the base price.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setField('sizes', [...formData.sizes, { name: '', price: 0 }])}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] text-xs font-bold border transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      >
                        <Plus size={13} /> Add Variant
                      </button>
                    </div>

                    {formData.sizes && formData.sizes.length > 0 ? (
                      <div className="space-y-3">
                        {formData.sizes.map((sz, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <input
                              type="text"
                              placeholder="(e.g. Large)"
                              value={sz.name}
                              onChange={(e) => {
                                const newSizes = [...formData.sizes]
                                newSizes[idx].name = e.target.value
                                setField('sizes', newSizes)
                              }}
                              className="flex-1 px-4 py-2 text-xs rounded-[5px] border outline-none font-semibold"
                              style={{
                                background: 'var(--color-bg)',
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text)',
                              }}
                            />
                            <div className="relative w-36">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                                +$
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={sz.price}
                                onChange={(e) => {
                                  const newSizes = [...formData.sizes]
                                  newSizes[idx].price = parseFloat(e.target.value) || 0
                                  setField('sizes', newSizes)
                                }}
                                className="w-full pl-8 pr-4 py-2 text-xs font-mono font-bold rounded-[5px] border outline-none"
                                style={{
                                  background: 'var(--color-bg)',
                                  borderColor: 'var(--color-border)',
                                  color: 'var(--color-text)',
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newSizes = formData.sizes.filter((_, i) => i !== idx)
                                setField('sizes', newSizes)
                              }}
                              className="w-9 h-9 flex items-center justify-center shrink-0 text-slate-400 hover:text-rose-600 rounded-[5px] hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        className="p-6 border border-dashed rounded-[5px] text-center text-xs"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-muted)',
                        }}
                      >
                        No variants added. Item will have a single standard price.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── TAB 3: Station Settings ───────────────────── */}
              <div id="Station" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Station Settings
                </h3>
                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-6"
                  style={{
                    background: 'var(--color-surface)',
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Station Routing
                      </label>
                      <SearchSelection
                        name="station_id"
                        options={stationOptions}
                        valueKey="id"
                        labelKey="name"
                        value={formData.station_id ? String(formData.station_id) : ''}
                        onChange={(val) => setField('station_id', val ? String(val) : '')}
                        placeholder={stations.length === 0 ? "Default Kitchen" : "Select Preparation Station..."}
                        searchPlaceholder="Search station..."
                        emptyMessage="No stations found for this venue"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                        Prep Time (mins)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={formData.prep_time_mins}
                        onChange={(e) => setField('prep_time_mins', e.target.value)}
                        className="w-full px-4 py-2.5 text-xs rounded-[5px] border outline-none font-mono font-bold"
                        style={{
                          background: 'var(--color-bg)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── TAB 4: Add-ons ───────────────────── */}
              <div id="addons" className="space-y-2.5 scroll-mt-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Add-ons
                </h3>
                <div
                  className="rounded-[5px] p-6 sm:p-7 space-y-4"
                  style={{
                    background: 'var(--color-surface)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-black uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>
                        Available Add-ons &amp; Option Groups
                      </label>
                      <button
                        type="button"
                        onClick={() => setAddonModalOpen(true)}
                        className="text-xs font-bold hover:underline flex items-center gap-1"
                        style={{ color: 'var(--color-500, #BF4040)' }}
                      >
                        <Plus size={13} /> Create Add-on
                      </button>
                    </div>
                    <p className="text-xs mb-4" style={{ color: 'var(--color-muted)' }}>
                      Select which add-ons or option modifier groups can be configured for this product.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[420px] overflow-y-auto pr-1">
                      {optionGroupsList.length === 0 ? (
                        <div
                          className="col-span-full py-8 text-center text-xs border border-dashed rounded-[5px]"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-muted)',
                          }}
                        >
                          No active add-ons found. Click &ldquo;+ Create Add-on&rdquo; to add custom option modifiers.
                        </div>
                      ) : (
                        optionGroupsList.map((group) => {
                          const isSelected = formData.option_group_ids.includes(group.id)
                          const valuesCount = group.values?.length || 0

                          return (
                            <div
                              key={group.id}
                              className={`p-4 rounded-[5px] border transition-all flex flex-col justify-between shadow-2xs ${
                                isSelected
                                  ? 'border-[#BF4040] shadow-xs'
                                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                              }`}
                              style={{
                                borderColor: isSelected ? 'var(--color-500, #BF4040)' : 'var(--color-border)',
                                background: isSelected ? 'rgba(191, 64, 64, 0.04)' : 'var(--color-card)',
                              }}
                            >
                              <div>
                                {/* Header Toggle */}
                                <div
                                  onClick={() => {
                                    const newOptionGroupIDs = isSelected
                                      ? formData.option_group_ids.filter((id) => id !== group.id)
                                      : [...formData.option_group_ids, group.id]
                                    setField('option_group_ids', newOptionGroupIDs)
                                  }}
                                  className="flex items-center justify-between cursor-pointer select-none pb-2.5 border-b"
                                  style={{ borderColor: 'var(--color-border)' }}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                      className={`w-5 h-5 rounded-[5px] border flex items-center justify-center shrink-0 transition-all ${
                                        isSelected
                                          ? 'bg-[#BF4040] border-[#BF4040] text-white shadow-2xs'
                                          : 'border-slate-300 dark:border-slate-600 bg-transparent'
                                      }`}
                                    >
                                      {isSelected && <Check size={12} strokeWidth={3} />}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <p
                                          className="text-xs font-bold truncate"
                                          style={{
                                            color: isSelected ? 'var(--color-500, #BF4040)' : 'var(--color-text)',
                                          }}
                                        >
                                          {group.name}
                                        </p>
                                        {group.outlet && (
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                            {group.outlet.name}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
                                        {valuesCount} {valuesCount === 1 ? 'choice' : 'choices'} • {group.type === 'single' ? 'Single Choice' : 'Multiple'}
                                      </span>
                                    </div>
                                  </div>

                                  <span
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-[5px] border shrink-0"
                                    style={{
                                      background: group.is_required ? 'rgba(245, 158, 11, 0.1)' : 'var(--color-bg)',
                                      borderColor: group.is_required ? 'rgba(245, 158, 11, 0.3)' : 'var(--color-border)',
                                      color: group.is_required ? '#d97706' : 'var(--color-muted)',
                                    }}
                                  >
                                    {group.is_required ? 'Required' : 'Optional'}
                                  </span>
                                </div>

                                {/* Choices List with Name and Price */}
                                <div className="mt-3 space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
                                      Choices &amp; Prices
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setQuickAddChoiceGroup(group)
                                      }}
                                      className="text-[11px] font-bold flex items-center gap-1 hover:underline text-[var(--color-500,#BF4040)]"
                                    >
                                      <Plus size={11} strokeWidth={3} /> Add Option
                                    </button>
                                  </div>

                                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                                    {(group.values || []).length > 0 ? (
                                      group.values.map((val, idx) => (
                                        <span
                                          key={idx}
                                          className="text-[11px] px-2.5 py-1 rounded-[5px] border flex items-center gap-1.5 font-medium shadow-2xs"
                                          style={{
                                            background: 'var(--color-bg)',
                                            borderColor: 'var(--color-border)',
                                            color: 'var(--color-text)',
                                          }}
                                        >
                                          <span>{val.name}</span>
                                          <span
                                            className="font-mono font-bold text-[10px]"
                                            style={{
                                              color: val.price > 0 ? 'var(--color-500, #BF4040)' : 'var(--color-muted)',
                                            }}
                                          >
                                            {val.price > 0 ? `+$${Number(val.price).toFixed(2)}` : 'Free'}
                                          </span>
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-[11px] italic text-[var(--color-muted)]">
                                        No choices yet. Click &ldquo;+ Add Option&rdquo; to add.
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Popups */}
      <QuickAddOptionModal
        isOpen={Boolean(quickAddChoiceGroup)}
        group={quickAddChoiceGroup}
        onClose={() => setQuickAddChoiceGroup(null)}
        onSave={handleQuickAddChoiceToGroup}
      />
      <CreateAddonModal
        isOpen={addonModalOpen}
        onClose={() => setAddonModalOpen(false)}
        onSave={handleCreateAddonGroup}
      />
      <CreateSubCatModal
        isOpen={subCatModalOpen}
        onClose={() => setSubCatModalOpen(false)}
        onSave={handleCreateSubCat}
      />
    </div>
  )
}
