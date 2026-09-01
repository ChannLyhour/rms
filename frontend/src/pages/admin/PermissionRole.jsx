import React, { useState, useEffect, useMemo, useCallback } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import {
  Check,
  Plus,
  Search,
  RotateCcw,
  Pencil,
  Trash2,
  RefreshCw,
  AlertCircle,
  FolderTree,
  Table,
  Users,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react'
import { adminApi } from '../../api/adminApi'
import toast from 'react-hot-toast'
import {
  Tree,
  TreeItem,
  TreeItemLabel,
  useTree,
  hotkeysCoreFeature,
  syncDataLoaderFeature,
} from '@/components/reui/tree'
import { Checkbox } from '@/components/ui/checkbox'

const PERMISSION_META = {
  'users.manage':        { module: 'System & Security',      name: 'Staff User Management',        desc: 'Create and update staff accounts and passwords' },
  'menu.manage':         { module: 'Product & Menu Catalog', name: 'Manage Catalog & Menu',        desc: 'Add items, upload photos, update prices and categories' },
  'tables.manage':       { module: 'System & Security',      name: 'Tables & Floor Plan Setup',    desc: 'Configure dining zones and generate table QRs' },
  'orders.create':       { module: 'Point of Sale (POS)',    name: 'Create & Place Orders',        desc: 'Select products, add items to cart, and send orders to kitchen' },
  'orders.kitchen_view': { module: 'Kitchen Display (KDS)', name: 'View & Update Kitchen Orders', desc: 'Access live KDS queue and update cooking progress' },
  'payments.process':    { module: 'Point of Sale (POS)',    name: 'Process Payments & Checkout',  desc: 'Collect cash, QR, and card payments to finalize sessions' },
  'stock.manage':        { module: 'Inventory & Supplies',   name: 'Manage Inventory & Restock',   desc: 'Check stock balances, threshold alerts, and restock' },
  'suppliers.manage':    { module: 'Inventory & Supplies',   name: 'Manage Suppliers & Vendors',   desc: 'Manage supplier contacts and purchase records' },
  'ingredients.manage':  { module: 'Inventory & Supplies',   name: 'Manage Ingredients & Recipes', desc: 'Link dishes to raw ingredient deductions' },
  'po.manage':           { module: 'Inventory & Supplies',   name: 'Supplier Purchase Orders',     desc: 'Record purchase orders and inventory deliveries' },
  'stock.waste':         { module: 'Inventory & Supplies',   name: 'Stock Audits & Wastage',       desc: 'Log manual inventory adjustments and spoilage' },
}

const ROLE_BADGE = {
  admin:   'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  cashier: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  kitchen: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  manager: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  waiter:  'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
}
const getBadge = (name) => ROLE_BADGE[name] || 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20'

function groupByModule(permissions) {
  const map = {}
  permissions.forEach((p) => {
    const meta = PERMISSION_META[p.slug] || {}
    const mod = meta.module || p.module || 'Other'
    if (!map[mod]) map[mod] = []
    map[mod].push({ ...p, displayName: meta.name || p.name, desc: meta.desc || p.description || '' })
  })
  return Object.entries(map).map(([module, perms]) => ({ module, perms }))
}

// ─────────────────────────────────────────────────────────────────────────────
// Tree View Component with Checkboxes
// ─────────────────────────────────────────────────────────────────────────────
function RolePermissionTreeView({
  selectedRole,
  permissions,
  onToggle,
  toggling,
  onBatchToggle,
}) {
  const [treeSearch, setTreeSearch] = useState('')
  const isAdmin = selectedRole?.name === 'admin'

  const grouped = useMemo(() => groupByModule(permissions), [permissions])

  const filteredGroups = useMemo(() => {
    const q = treeSearch.trim().toLowerCase()
    if (!q) return grouped
    return grouped
      .map((g) => ({
        ...g,
        perms: g.perms.filter(
          (p) =>
            p.displayName.toLowerCase().includes(q) ||
            p.slug.toLowerCase().includes(q) ||
            (p.desc && p.desc.toLowerCase().includes(q))
        ),
      }))
      .filter((g) => g.perms.length > 0)
  }, [grouped, treeSearch])

  // Build tree items lookup
  const treeData = useMemo(() => {
    const itemsMap = {}
    const moduleIds = []

    filteredGroups.forEach((g) => {
      const modId = `mod-${g.module}`
      moduleIds.push(modId)
      const childIds = g.perms.map((p) => `perm-${p.id}`)

      itemsMap[modId] = {
        id: modId,
        name: g.module,
        isModule: true,
        children: childIds,
        perms: g.perms,
      }

      g.perms.forEach((p) => {
        const permId = `perm-${p.id}`
        itemsMap[permId] = {
          id: permId,
          name: p.displayName,
          slug: p.slug,
          desc: p.desc,
          perm: p,
          isModule: false,
        }
      })
    })

    itemsMap['root'] = {
      id: 'root',
      name: 'All Modules',
      children: moduleIds,
    }

    return { itemsMap, moduleIds }
  }, [filteredGroups])

  const tree = useTree({
    initialState: {
      expandedItems: treeData.moduleIds,
    },
    indent: 24,
    rootItemId: 'root',
    getItemName: (item) => item.getItemData()?.name,
    isItemFolder: (item) => Boolean(item.getItemData()?.children?.length > 0),
    dataLoader: {
      getItem: (itemId) => treeData.itemsMap[itemId],
      getChildren: (itemId) => treeData.itemsMap[itemId]?.children ?? [],
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature],
  })

  // Auto-expand all when search query changes
  useEffect(() => {
    if (treeSearch.trim()) {
      tree.expandAll(treeData.moduleIds)
    }
  }, [treeSearch, treeData.moduleIds, tree])

  const handleExpandAll = () => tree.expandAll(treeData.moduleIds)
  const handleCollapseAll = () => tree.collapseAll()

  const handleGrantAll = () => {
    if (isAdmin) return
    const ungranted = permissions.filter(
      (p) => !selectedRole?.permissions?.some((rp) => rp.id === p.id)
    )
    if (ungranted.length > 0 && onBatchToggle) {
      onBatchToggle(selectedRole, ungranted, true)
    }
  }

  const handleRevokeAll = () => {
    if (isAdmin) return
    const granted = selectedRole?.permissions || []
    if (granted.length > 0 && onBatchToggle) {
      onBatchToggle(selectedRole, granted, false)
    }
  }

  const totalGranted = isAdmin
    ? permissions.length
    : selectedRole?.permissions?.length || 0

  return (
    <div
      className="rounded-[5px] border overflow-hidden shadow-2xs space-y-0"
      style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      {/* Tree Card Header */}
      <div
        className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-[5px] border flex items-center justify-center font-bold text-sm ${getBadge(
              selectedRole?.name
            )}`}
          >
            {isAdmin ? <Shield size={18} /> : <Layers size={18} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                {selectedRole?.display_name || selectedRole?.name || 'Select Role'}
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-[5px] border ${getBadge(
                  selectedRole?.name
                )}`}
              >
                {selectedRole?.name}
              </span>
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-muted)' }}>
              {selectedRole?.description ||
                (isAdmin
                  ? 'Full system privileges and unrestricted security access.'
                  : 'Manage role capabilities by toggling permissions in the tree.')}
            </p>
          </div>
        </div>

        {/* Tree Header Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
            />
            <input
              type="text"
              value={treeSearch}
              onChange={(e) => setTreeSearch(e.target.value)}
              placeholder="Filter tree items..."
              className="pl-7 pr-3 py-1.5 rounded-[5px] text-xs border outline-none font-medium w-40 sm:w-48"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleExpandAll}
            className="px-2.5 py-1.5 rounded-[5px] border text-[11px] font-semibold transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 cursor-pointer"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            title="Expand All"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={handleCollapseAll}
            className="px-2.5 py-1.5 rounded-[5px] border text-[11px] font-semibold transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 cursor-pointer"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            title="Collapse All"
          >
            Collapse All
          </button>

          {!isAdmin && (
            <>
              <button
                type="button"
                onClick={handleGrantAll}
                disabled={totalGranted === permissions.length}
                className="px-2.5 py-1.5 rounded-[5px] border text-[11px] font-semibold transition-all hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                Grant All
              </button>
              <button
                type="button"
                onClick={handleRevokeAll}
                disabled={totalGranted === 0}
                className="px-2.5 py-1.5 rounded-[5px] border text-[11px] font-semibold transition-all hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                Revoke All
              </button>
            </>
          )}

          <div
            className="px-2.5 py-1 rounded-[5px] font-mono text-xs font-bold border flex items-center gap-1.5"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            <span className="text-[10px] text-[var(--color-muted)]">Active:</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              {totalGranted} / {permissions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tree Content */}
      <div className="p-4 sm:p-6 min-h-[380px]">
        {isAdmin && (
          <div className="mb-4 p-3 rounded-[5px] border bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <Shield size={15} className="shrink-0" />
            <span>
              <strong>Administrator Access:</strong> All system features and security capabilities are permanently active for this role.
            </span>
          </div>
        )}

        {filteredGroups.length === 0 ? (
          <div
            className="py-12 text-center text-xs flex flex-col items-center gap-2"
            style={{ color: 'var(--color-muted)' }}
          >
            <AlertCircle size={20} />
            No permissions matching &ldquo;{treeSearch}&rdquo;
          </div>
        ) : (
          <Tree indent={24} tree={tree} toggleIconType="plus-minus" className="space-y-0.5">
            {tree.getItems().map((item) => {
              const id = item.getId()
              const itemData = item.getItemData()
              const isFolder = item.isFolder()

              // Module Node (Folder)
              if (isFolder) {
                const modulePerms = itemData?.perms || []
                const grantedInMod = isAdmin
                  ? modulePerms.length
                  : modulePerms.filter((p) =>
                      selectedRole?.permissions?.some((rp) => rp.id === p.id)
                    ).length
                const allInModGranted =
                  modulePerms.length > 0 && grantedInMod === modulePerms.length
                const someInModGranted = grantedInMod > 0 && !allInModGranted

                return (
                  <TreeItem
                    key={id}
                    item={item}
                    className="mt-2 py-1.5 px-2 rounded-[5px] font-semibold text-xs border border-transparent hover:border-[var(--color-border)] transition-colors"
                  >
                    <TreeItemLabel>
                      <div className="flex items-center justify-between w-full pr-1 gap-2">
                        <span
                          className="font-bold text-xs tracking-wide"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {item.getItemName()}
                        </span>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] border ${
                              allInModGranted
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : someInModGranted
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                            }`}
                          >
                            {grantedInMod} / {modulePerms.length}
                          </span>

                          {!isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (onBatchToggle) {
                                  onBatchToggle(
                                    selectedRole,
                                    modulePerms,
                                    !allInModGranted
                                  )
                                }
                              }}
                              className="text-[10px] font-medium px-2 py-0.5 rounded border hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-muted)',
                              }}
                              title={allInModGranted ? 'Revoke All in Module' : 'Grant All in Module'}
                            >
                              {allInModGranted ? 'Revoke All' : 'Grant All'}
                            </button>
                          )}
                        </div>
                      </div>
                    </TreeItemLabel>
                  </TreeItem>
                )
              }

              // Permission Node (Leaf)
              const perm = itemData?.perm
              const isGranted =
                isAdmin ||
                Boolean(selectedRole?.permissions?.some((p) => p.id === perm?.id))
              const busy = toggling.has(`${perm?.id}:${selectedRole?.id}`)

              return (
                <TreeItem
                  key={id}
                  item={item}
                  className="py-1.5 px-2 rounded-[5px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <TreeItemLabel className="not-in-data-[folder=true]:ps-5">
                    <div className="flex items-center justify-between w-full py-0.5 pr-1 gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Checkbox
                          checked={isGranted}
                          disabled={isAdmin || busy}
                          onCheckedChange={() => onToggle(selectedRole, perm)}
                          className={`size-3.5 ${
                            isAdmin
                              ? 'opacity-80 cursor-not-allowed'
                              : busy
                              ? 'opacity-40 cursor-wait'
                              : ''
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="text-xs font-semibold"
                              style={{ color: 'var(--color-text)' }}
                            >
                              {item.getItemName()}
                            </span>
                            <span className="font-mono text-[10px] text-[var(--color-muted)]">
                              {perm?.slug}
                            </span>
                          </div>
                          {perm?.desc && (
                            <p
                              className="text-[10px] leading-tight mt-0.5 truncate max-w-xl"
                              style={{ color: 'var(--color-muted)' }}
                            >
                              {perm.desc}
                            </p>
                          )}
                        </div>
                      </div>

                      {busy && (
                        <RefreshCw
                          size={12}
                          className="animate-spin text-emerald-500 shrink-0"
                        />
                      )}
                    </div>
                  </TreeItemLabel>
                </TreeItem>
              )
            })}
          </Tree>
        )}
      </div>

      {/* Tree Footer note */}
      <div
        className="px-4 py-2.5 border-t text-[11px] flex items-center justify-between"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-muted)',
        }}
      >
        <span className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-amber-500" />
          Click checkboxes to grant or revoke. Changes persist immediately to the database.
        </span>
        <span className="font-mono text-[10px]">
          {filteredGroups.reduce((acc, g) => acc + g.perms.length, 0)} capabilities available
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────
export default function PermissionRole() {
  const [roles, setRoles]               = useState([])
  const [permissions, setPermissions]   = useState([])
  const [users, setUsers]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [toggling, setToggling]         = useState(new Set())
  const [search, setSearch]             = useState('')
  const [activeModule, setActiveModule] = useState('all')
  const [activeTab, setActiveTab]       = useState('tree') // 'tree' | 'matrix' | 'users'
  const [selectedRoleId, setSelectedRoleId] = useState(null)
  const [roleModal, setRoleModal]       = useState(null)
  const [roleForm, setRoleForm]         = useState({ display_name: '', description: '' })
  const [saving, setSaving]             = useState(false)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [rolesRes, permsRes, usersRes] = await Promise.all([
        adminApi.getRoles(),
        adminApi.getPermissions(),
        adminApi.getUsers(),
      ])
      const fetchedRoles = rolesRes.data?.data || rolesRes.data || []
      setRoles(fetchedRoles)
      setPermissions(permsRes.data?.data || permsRes.data || [])
      setUsers(usersRes.data?.data || usersRes.data || [])

      if (fetchedRoles.length > 0 && !selectedRoleId) {
        // Default to first non-admin role if possible, else first role
        const nonAdmin = fetchedRoles.find((r) => r.name !== 'admin')
        setSelectedRoleId(nonAdmin ? nonAdmin.id : fetchedRoles[0].id)
      }
    } catch {
      toast.error('Failed to load roles & permissions')
    } finally {
      setLoading(false)
    }
  }, [selectedRoleId])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const selectedRole = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId) || roles[0] || null
  }, [roles, selectedRoleId])

  const handleToggle = useCallback(
    async (role, perm) => {
      if (!role || !perm) return
      if (role.name === 'admin') {
        toast('Administrator retains full system access', {
          icon: '🛡️',
          style: {
            borderRadius: '5px',
            background: 'var(--color-card)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            fontSize: '12px',
          },
        })
        return
      }
      const key = `${perm.id}:${role.id}`
      if (toggling.has(key)) return
      const isGranted = role.permissions?.some((p) => p.id === perm.id)

      setRoles((prev) =>
        prev.map((r) => {
          if (r.id !== role.id) return r
          const perms = isGranted
            ? (r.permissions || []).filter((p) => p.id !== perm.id)
            : [...(r.permissions || []), perm]
          return { ...r, permissions: perms }
        })
      )
      setToggling((prev) => new Set([...prev, key]))

      try {
        if (isGranted) {
          await adminApi.revokePermission(role.id, perm.id)
        } else {
          await adminApi.assignPermission(role.id, perm.id)
        }
      } catch {
        setRoles((prev) =>
          prev.map((r) => {
            if (r.id !== role.id) return r
            const perms = isGranted
              ? [...(r.permissions || []), perm]
              : (r.permissions || []).filter((p) => p.id !== perm.id)
            return { ...r, permissions: perms }
          })
        )
        toast.error('Failed to update permission')
      } finally {
        setToggling((prev) => {
          const s = new Set(prev)
          s.delete(key)
          return s
        })
      }
    },
    [toggling]
  )

  const handleBatchToggle = useCallback(
    async (role, targetPerms, grant) => {
      if (!role || role.name === 'admin' || !targetPerms || targetPerms.length === 0) return

      for (const perm of targetPerms) {
        const isGranted = role.permissions?.some((p) => p.id === perm.id)
        if (grant && !isGranted) {
          await handleToggle(role, perm)
        } else if (!grant && isGranted) {
          await handleToggle(role, perm)
        }
      }
    },
    [handleToggle]
  )

  const handleSaveRole = async (e) => {
    e.preventDefault()
    if (!roleForm.display_name.trim()) return
    setSaving(true)
    try {
      const payload = {
        name: roleForm.display_name.trim().toLowerCase().replace(/\s+/g, '_'),
        display_name: roleForm.display_name.trim(),
        description: roleForm.description.trim() || null,
      }
      if (roleModal === 'create') {
        const res = await adminApi.createRole(payload)
        const newRole = res.data?.data || res.data
        toast.success(`Role "${payload.display_name}" created`)
        if (newRole?.id) setSelectedRoleId(newRole.id)
      } else {
        await adminApi.updateRole(roleModal.id, payload)
        toast.success(`Role "${payload.display_name}" updated`)
      }
      setRoleModal(null)
      await loadAll()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save role')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRole = async (role) => {
    if (!window.confirm(`Delete role "${role.display_name || role.name}"?`)) return
    try {
      await adminApi.deleteRole(role.id)
      toast.success('Role deleted')
      if (selectedRoleId === role.id) {
        const remaining = roles.filter((r) => r.id !== role.id)
        setSelectedRoleId(remaining[0]?.id || null)
      }
      await loadAll()
    } catch {
      toast.error('Cannot delete this role')
    }
  }

  const grouped = useMemo(() => groupByModule(permissions), [permissions])
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return grouped
      .filter((g) => activeModule === 'all' || g.module === activeModule)
      .map((g) => ({
        ...g,
        perms: q
          ? g.perms.filter(
              (p) =>
                p.displayName.toLowerCase().includes(q) ||
                p.slug.toLowerCase().includes(q)
            )
          : g.perms,
      }))
      .filter((g) => g.perms.length > 0)
  }, [grouped, activeModule, search])

  const roleStats = useMemo(() => {
    const total = permissions.length
    const counts = {}
    roles.forEach((r) => {
      counts[r.id] = r.permissions?.length || 0
    })
    return { total, counts }
  }, [roles, permissions])

  if (loading) {
    return (
      <AdminLayout>
        <div
          className="flex items-center justify-center h-64 text-xs"
          style={{ color: 'var(--color-muted)' }}
        >
          <RefreshCw size={14} className="animate-spin mr-2" /> Loading...
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-10 select-none">
        {/* Header */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <div className="flex items-center gap-2">
              <h1
                className="text-xl font-extrabold tracking-tight"
                style={{ color: 'var(--color-text)' }}
              >
                Roles & Permissions
              </h1>
              <span className="px-2.5 py-0.5 rounded-[5px] text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {roles.length} Roles
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Configure role capabilities hierarchically using the permission tree or the full comparison matrix.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[5px] border text-xs font-semibold transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 cursor-pointer"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-muted)',
              }}
            >
              <RotateCcw size={13} /> Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleForm({ display_name: '', description: '' })
                setRoleModal('create')
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-[5px] border text-xs font-semibold transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 cursor-pointer"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <Plus size={14} /> Add Role
            </button>
          </div>
        </div>

        {/* Role Summary Cards (Clickable to switch active role in Tree View) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {roles.map((r) => {
            const isSelected = selectedRoleId === r.id
            const count =
              r.name === 'admin'
                ? roleStats.total
                : roleStats.counts[r.id] || 0

            return (
              <div
                key={r.id}
                onClick={() => {
                  setSelectedRoleId(r.id)
                  if (activeTab !== 'tree') setActiveTab('tree')
                }}
                className={`rounded-[5px] p-3.5 border flex flex-col justify-between shadow-2xs hover:shadow-sm transition-all space-y-2.5 relative group cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-emerald-500/70 border-emerald-500/50'
                    : ''
                }`}
                style={{
                  background: 'var(--color-card)',
                  borderColor: isSelected
                    ? undefined
                    : 'var(--color-border)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] border truncate max-w-[110px] ${getBadge(
                        r.name
                      )}`}
                    >
                      {r.display_name || r.name}
                    </span>
                    {!['admin', 'cashier', 'kitchen'].includes(r.name) && (
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setRoleForm({
                              display_name: r.display_name || r.name,
                              description: r.description || '',
                            })
                            setRoleModal(r)
                          }}
                          className="p-1 rounded-[5px] hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                          title="Edit"
                        >
                          <Pencil
                            size={10}
                            style={{ color: 'var(--color-muted)' }}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteRole(r)
                          }}
                          className="p-1 rounded-[5px] hover:bg-red-500/10 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={10} className="text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                  {r.description && (
                    <p
                      className="text-[10px] line-clamp-2 leading-relaxed"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      {r.description}
                    </p>
                  )}
                </div>
                <div
                  className="pt-2 border-t flex items-center justify-between text-[10px]"
                  style={{ borderColor: 'var(--color-border-subtle)' }}
                >
                  <span style={{ color: 'var(--color-muted)' }}>Permissions:</span>
                  <span
                    className="font-mono font-bold"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {count}/{roleStats.total}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* View Switcher Subheader */}
        <div
          className="rounded-[5px] p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{
            background: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('tree')}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tree'
                  ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                  : 'text-[var(--color-muted)] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <FolderTree size={14} /> Permission Tree
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                  : 'text-[var(--color-muted)] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Table size={14} /> Matrix View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                  : 'text-[var(--color-muted)] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Users size={14} /> Staff Accounts
              {users.length > 0 && (
                <span className="px-1.5 rounded-[5px] text-[10px] bg-black/10 dark:bg-white/10">
                  {users.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'matrix' && (
            <div className="flex items-center gap-2">
              <select
                value={activeModule}
                onChange={(e) => setActiveModule(e.target.value)}
                className="px-2.5 py-1.5 rounded-[5px] text-xs border outline-none font-medium cursor-pointer"
                style={{
                  background: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                <option value="all">All Modules</option>
                {grouped.map((g) => (
                  <option key={g.module} value={g.module}>
                    {g.module}
                  </option>
                ))}
              </select>
              <div className="relative">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search rules..."
                  className="pl-7 pr-3 py-1.5 rounded-[5px] text-xs border outline-none font-medium w-40 sm:w-48"
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

        {/* 1. PERMISSION TREE VIEW */}
        {activeTab === 'tree' && selectedRole && (
          <RolePermissionTreeView
            selectedRole={selectedRole}
            permissions={permissions}
            onToggle={handleToggle}
            toggling={toggling}
            onBatchToggle={handleBatchToggle}
          />
        )}

        {/* 2. PERMISSION MATRIX VIEW */}
        {activeTab === 'matrix' && (
          <div className="space-y-4">
            {permissions.length === 0 ? (
              <div
                className="p-10 rounded-[5px] border text-center text-xs flex flex-col items-center gap-3"
                style={{
                  background: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-muted)',
                }}
              >
                <AlertCircle size={24} />
                No permissions found in the database.
              </div>
            ) : filtered.length === 0 ? (
              <div
                className="p-8 rounded-[5px] border text-center text-xs"
                style={{
                  background: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-muted)',
                }}
              >
                No permissions match your search.
              </div>
            ) : (
              filtered.map((group) => (
                <div
                  key={group.module}
                  className="rounded-[5px] border overflow-hidden shadow-2xs"
                  style={{
                    background: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div
                    className="px-4 py-2.5 border-b font-bold text-xs tracking-wide"
                    style={{
                      background: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  >
                    {group.module}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr
                          className="border-b text-[11px] font-semibold"
                          style={{
                            background: 'var(--color-bg)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-muted)',
                          }}
                        >
                          <th className="py-2.5 px-4 font-bold">Capability</th>
                          <th className="py-2.5 px-3 font-mono text-[10px] hidden md:table-cell w-36">
                            Slug
                          </th>
                          {roles.map((r) => (
                            <th
                              key={r.id}
                              className="py-2.5 px-3 text-center w-24 font-bold"
                            >
                              {r.display_name || r.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody
                        className="divide-y"
                        style={{ borderColor: 'var(--color-border-subtle)' }}
                      >
                        {group.perms.map((perm) => (
                          <tr
                            key={perm.id}
                            className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          >
                            <td className="py-3 px-4 min-w-[200px]">
                              <p
                                className="font-semibold"
                                style={{ color: 'var(--color-text)' }}
                              >
                                {perm.displayName}
                              </p>
                              {perm.desc && (
                                <p
                                  className="text-[11px] mt-0.5"
                                  style={{ color: 'var(--color-muted)' }}
                                >
                                  {perm.desc}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono text-[10px] hidden md:table-cell text-[var(--color-muted)]">
                              {perm.slug}
                            </td>
                            {roles.map((role) => {
                              const isAdmin = role.name === 'admin'
                              const isGranted =
                                isAdmin ||
                                Boolean(
                                  role.permissions?.some((p) => p.id === perm.id)
                                )
                              const busy = toggling.has(
                                `${perm.id}:${role.id}`
                              )
                              return (
                                <td
                                  key={role.id}
                                  className="py-3 px-3 text-center align-middle"
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleToggle(role, perm)}
                                    disabled={isAdmin || busy}
                                    className={`w-6 h-6 mx-auto rounded-[5px] border flex items-center justify-center transition-all ${
                                      busy
                                        ? 'opacity-40 cursor-wait'
                                        : isAdmin
                                        ? 'bg-emerald-600/20 border-emerald-600/40 text-emerald-600 dark:text-emerald-400 cursor-not-allowed'
                                        : isGranted
                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs cursor-pointer hover:bg-emerald-700'
                                        : 'border-slate-300 dark:border-slate-700 bg-transparent text-transparent cursor-pointer hover:border-slate-400'
                                    }`}
                                    title={
                                      isAdmin
                                        ? 'Administrator — always granted'
                                        : isGranted
                                        ? 'Click to revoke'
                                        : 'Click to grant'
                                    }
                                  >
                                    {(isGranted || isAdmin) && (
                                      <Check size={13} strokeWidth={3} />
                                    )}
                                  </button>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. STAFF ACCOUNTS VIEW */}
        {activeTab === 'users' && (
          <div
            className="rounded-[5px] border overflow-hidden shadow-2xs"
            style={{
              background: 'var(--color-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div
              className="px-4 py-3 border-b"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <h2
                className="text-xs font-bold"
                style={{ color: 'var(--color-text)' }}
              >
                Assigned Staff Accounts
              </h2>
            </div>
            {users.length === 0 ? (
              <div
                className="p-8 text-center text-xs"
                style={{ color: 'var(--color-muted)' }}
              >
                No staff users found.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr
                    className="border-b text-[11px] font-semibold"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-muted)',
                    }}
                  >
                    <th className="py-2.5 px-4 font-bold">Name</th>
                    <th className="py-2.5 px-4 font-bold">Username</th>
                    <th className="py-2.5 px-4 font-bold">Role</th>
                    <th className="py-2.5 px-4 font-bold text-right">
                      Permissions
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y"
                  style={{ borderColor: 'var(--color-border-subtle)' }}
                >
                  {users.map((u) => {
                    const roleObj = roles.find((r) => r.name === u.role?.name)
                    const granted =
                      u.role?.name === 'admin'
                        ? roleStats.total
                        : roleObj
                        ? roleStats.counts[roleObj.id] || 0
                        : 0
                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <td
                          className="py-3 px-4 font-bold"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {u.name}
                        </td>
                        <td
                          className="py-3 px-4 font-mono text-[11px]"
                          style={{ color: 'var(--color-muted)' }}
                        >
                          @{u.username}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-[5px] border ${getBadge(
                              u.role?.name
                            )}`}
                          >
                            {u.role?.display_name || u.role?.name || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {granted} / {roleStats.total}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Add/Edit Role Modal */}
        {roleModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div
              className="rounded-[5px] p-5 w-full max-w-sm border shadow-xl space-y-4"
              style={{
                background: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div
                className="border-b pb-2"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <h2
                  className="text-sm font-bold"
                  style={{ color: 'var(--color-text)' }}
                >
                  {roleModal === 'create'
                    ? 'Add Custom Role'
                    : `Edit ${roleModal.display_name || roleModal.name}`}
                </h2>
              </div>
              <form onSubmit={handleSaveRole} className="space-y-3 text-xs">
                <div>
                  <label
                    className="font-semibold block mb-1"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={roleForm.display_name}
                    onChange={(e) =>
                      setRoleForm({
                        ...roleForm,
                        display_name: e.target.value,
                      })
                    }
                    placeholder="e.g. Store Manager"
                    className="w-full px-3 py-2 rounded-[5px] border outline-none font-medium text-xs"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
                <div>
                  <label
                    className="font-semibold block mb-1"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={roleForm.description}
                    onChange={(e) =>
                      setRoleForm({
                        ...roleForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Brief summary of duties..."
                    className="w-full px-3 py-2 rounded-[5px] border outline-none font-medium text-xs resize-none"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
                <div
                  className="flex items-center gap-2 pt-2 border-t"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <button
                    type="button"
                    onClick={() => setRoleModal(null)}
                    className="flex-1 py-2 rounded-[5px] font-semibold border transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2 rounded-[5px] font-bold text-white shadow-xs transition-all hover:opacity-90 active:scale-95 cursor-pointer disabled:opacity-60"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))',
                    }}
                  >
                    {saving
                      ? 'Saving...'
                      : roleModal === 'create'
                      ? 'Create'
                      : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
