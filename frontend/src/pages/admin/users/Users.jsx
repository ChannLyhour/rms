import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../../../components/layout/AdminLayout'
import {
  TableCard,
  Table,
  BadgeWithIcon,
  Button as TableButton,
  PaginationPageMinimalCenter,
  Avatar,
} from '../../../components/TablesComponents'
import { CreateButton } from '../../../components/common/ButtonComponent'
import { adminApi } from '../../../api/adminApi'
import axiosClient from '../../../api/axiosClient'
import { SearchLg, Plus, Edit01, Trash01, Check, X, User01, Mail01, Lock01, Shield01 } from '@untitledui/icons'
import { Building2, Utensils, ShoppingCart, Wine, Coffee, Shield, ChefHat, Receipt, Users as UsersIcon, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import UsersCreateView from './UsersCreateView'

const ROLE_CONFIG = {
  admin: {
    label: 'Administrator',
    badgeColor: 'error',
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-500/20',
    dot: 'bg-red-500',
  },
  cashier: {
    label: 'Cashier',
    badgeColor: 'success',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  kitchen: {
    label: 'Kitchen Staff',
    badgeColor: 'warning',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
    dot: 'bg-amber-500',
  },
  waiter: {
    label: 'Waiter / Service',
    badgeColor: 'blue',
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500/20',
    dot: 'bg-cyan-500',
  },
  manager: {
    label: 'Manager',
    badgeColor: 'purple',
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20',
    dot: 'bg-purple-500',
  },
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [outlets, setOutlets] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [outletFilter, setOutletFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'id',
    direction: 'ascending',
  })

  // View state: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState('list')
  const [editingUser, setEditingUser] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, rolesRes, outletsRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getRoles().catch(() => ({ data: { data: [] } })),
        axiosClient.get('/outlets').catch(() => ({ data: { data: [] } })),
      ])
      setUsers(usersRes.data?.data || [])
      setRoles(rolesRes.data?.data || [])
      setOutlets(outletsRes.data?.data || [])
    } catch (err) {
      console.error('Failed to load users data:', err)
      toast.error('Failed to load user accounts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Role Counts
  const roleCounts = useMemo(() => {
    const counts = { all: users.length, admin: 0, cashier: 0, kitchen: 0, waiter: 0 }
    users.forEach((u) => {
      const r = (u.role?.name || 'cashier').toLowerCase()
      if (counts[r] !== undefined) counts[r]++
      else counts[r] = 1
    })
    return counts
  }, [users])

  // Filtered Users
  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim()
    return users.filter((u) => {
      const matchSearch = q
        ? u.name?.toLowerCase().includes(q) ||
          u.username?.toLowerCase().includes(q) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.role?.name && u.role.name.toLowerCase().includes(q))
        : true

      const roleKey = (u.role?.name || 'cashier').toLowerCase()
      const matchRole = roleFilter === 'all' ? true : roleKey === roleFilter.toLowerCase()

      const matchOutlet =
        outletFilter === 'all'
          ? true
          : u.outlet_id
          ? String(u.outlet_id) === String(outletFilter)
          : true

      return matchSearch && matchRole && matchOutlet
    })
  }, [users, search, roleFilter, outletFilter])

  // Sorted Users
  const sortedUsers = useMemo(() => {
    const list = [...filteredUsers]
    return list.sort((a, b) => {
      let first = a[sortDescriptor.column]
      let second = b[sortDescriptor.column]

      if (sortDescriptor.column === 'role') {
        first = a.role?.name || ''
        second = b.role?.name || ''
      }

      if (typeof first === 'number' && typeof second === 'number') {
        return sortDescriptor.direction === 'descending' ? second - first : first - second
      }
      if (typeof first === 'string' && typeof second === 'string') {
        const cmp = first.localeCompare(second)
        return sortDescriptor.direction === 'descending' ? -cmp : cmp
      }
      return 0
    })
  }, [filteredUsers, sortDescriptor])

  const totalPages = Math.ceil(sortedUsers.length / pageSize) || 1
  const paginatedUsers = sortedUsers.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (columnId) => {
    setSortDescriptor((prev) => ({
      column: columnId,
      direction:
        prev.column === columnId && prev.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }))
  }

  const openCreate = () => {
    setEditingUser(null)
    setViewMode('create')
  }

  const openEdit = (u) => {
    setEditingUser(u)
    setViewMode('edit')
  }

  const handleSaveUser = async (payload) => {
    try {
      if (editingUser) {
        await adminApi.updateUser(editingUser.id, payload)
        toast.success('Staff account updated successfully')
      } else {
        await adminApi.createUser(payload)
        toast.success('Staff account created successfully')
      }
      setViewMode('list')
      setEditingUser(null)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save user account')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this user account?')) return
    try {
      await adminApi.deleteUser(id)
      toast.success('User account deactivated')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to deactivate user')
    }
  }

  const getOutletIcon = (type, size = 16, className = '') => {
    switch (type) {
      case 'cafe':
        return <Coffee size={size} className={className || "text-amber-600 dark:text-amber-400 shrink-0"} />
      case 'bar':
        return <Wine size={size} className={className || "text-purple-600 dark:text-purple-400 shrink-0"} />
      case 'retail':
        return <ShoppingCart size={size} className={className || "text-emerald-600 dark:text-emerald-400 shrink-0"} />
      case 'dine_in':
      default:
        return <Utensils size={size} className={className || "text-[#126973] dark:text-[#F1D8C2] shrink-0"} />
    }
  }

  return (
    <AdminLayout>
      {viewMode === 'create' || viewMode === 'edit' ? (
        <UsersCreateView
          user={editingUser}
          onClose={() => {
            setViewMode('list')
            setEditingUser(null)
          }}
          onSave={handleSaveUser}
        />
      ) : (
        <div className="space-y-6 max-w-7xl mx-auto pb-10 select-none animate-in fade-in duration-200">
          {/* ── Header Row ── */}
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div>
              <h1
                className="text-xl font-extrabold tracking-tight"
                style={{ color: 'var(--color-text)' }}
              >
                Staff &amp; User Management
              </h1>
              <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                Manage employee accounts, role assignments, access permissions, and venue assignments.
              </p>
            </div>

            <CreateButton
              label="Add User Account"
              onClick={openCreate}
            />
          </div>

          {/* ── Role Filter Tabs ── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative overflow-x-auto no-scrollbar">
              <div
                className="flex items-center gap-1 rounded-xl p-1 border"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderColor: 'var(--color-border)',
                }}
              >
                {[
                  { id: 'all', label: 'All User', icon: UsersIcon, count: roleCounts.all },
                  { id: 'admin', label: 'Admin', icon: Shield, count: roleCounts.admin || 0 },
                  { id: 'cashier', label: 'Cashier', icon: Receipt, count: roleCounts.cashier || 0 },
                  { id: 'kitchen', label: 'Kitchen', icon: ChefHat, count: roleCounts.kitchen || 0 },
                  { id: 'waiter', label: 'Waiter', icon: Utensils, count: roleCounts.waiter || 0 },
                ].map((tab) => {
                  const Icon = tab.icon
                  const isActive = roleFilter === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setRoleFilter(tab.id)
                        setPage(1)
                      }}
                      className={`inline-flex items-center gap-2 h-9 px-3 rounded-lg text-xs transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive
                          ? 'shadow-xs font-semibold'
                          : 'hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                      style={
                        isActive
                          ? {
                              background: 'var(--color-surface, #1e2230)',
                              color: 'var(--color-text, #ffffff)',
                              border: '1px solid var(--color-border)',
                            }
                          : {
                              color: 'var(--color-muted, #94a3b8)',
                            }
                      }
                    >
                      <Icon size={14} className="shrink-0 text-[#126973] dark:text-[#F1D8C2]" />
                      <span>{tab.label}</span>
                      <span
                        className="inline-flex items-center justify-center rounded px-1.5 h-4.5 text-[10px] font-semibold"
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

            {/* Search Box */}
            <div
              className="flex items-center gap-3 px-3.5 py-2 rounded-[5px] border text-xs min-w-[240px] max-w-sm shadow-xs"
              style={{
                background: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <SearchLg size={16} className="text-[var(--color-muted)] shrink-0 stroke-[2px]" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search..."
                className="bg-transparent border-none outline-none w-full text-xs placeholder:text-[var(--color-muted)] text-[var(--color-text)]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-[11px] font-medium transition-colors hover:text-red-500 text-[var(--color-muted)]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* ── Main Users Table ── */}
          <TableCard.Root>
            <Table aria-label="Staff Accounts Table" sortDescriptor={sortDescriptor}>
              <Table.Header>
                <Table.Head
                  id="name"
                  label="Staff Member"
                  isRowHeader
                  allowsSorting
                  sortDescriptor={sortDescriptor}
                  onSort={handleSort}
                />
                <Table.Head
                  id="role"
                  label="System Role"
                  allowsSorting
                  sortDescriptor={sortDescriptor}
                  onSort={handleSort}
                />
                <Table.Head
                  id="email"
                  label="Email / Contact"
                  allowsSorting
                  sortDescriptor={sortDescriptor}
                  onSort={handleSort}
                />
                
                <Table.Head id="status" label="Status" />
                <Table.Head id="actions" className="text-right">
                  Actions
                </Table.Head>
              </Table.Header>

              <Table.Body items={paginatedUsers}>
                {(u) => {
                  const roleKey = (u.role?.name || 'cashier').toLowerCase()
                  const roleConf = ROLE_CONFIG[roleKey] || ROLE_CONFIG.cashier
                  const assignedOutlet = outlets.find((o) => String(o.id) === String(u.outlet_id))

                  return (
                    <Table.Row key={u.id} id={u.id}>
                      {/* User Identity */}
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={u.image_url}
                            initials={u.name ? u.name.slice(0, 2).toUpperCase() : 'U'}
                            size="md"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-xs truncate leading-snug" style={{ color: 'var(--color-text)' }}>
                                {u.name}
                              </p>
                            </div>
                            <p className="text-[11px] font-mono truncate opacity-75" style={{ color: 'var(--color-muted)' }}>
                              @{u.username}
                            </p>
                          </div>
                        </div>
                      </Table.Cell>

                      {/* Role Badge */}
                      <Table.Cell>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-[5px] bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/20`}>
                         
                          {roleConf.label}
                        </span>
                      </Table.Cell>

                      {/* Email */}
                      <Table.Cell>
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text)' }}>
                          <Mail01 size={13} className="text-[var(--color-muted)] shrink-0" />
                          <span className="truncate">{u.email || <span className="text-[var(--color-muted)] italic">No email</span>}</span>
                        </div>
                      </Table.Cell>

                      

                      {/* Status */}
                      <Table.Cell>
                        <BadgeWithIcon
                          size="sm"
                          color="success"
                          iconLeading={Check}
                          className="font-semibold capitalize"
                        >
                          Active
                        </BadgeWithIcon>
                      </Table.Cell>

                      {/* Actions */}
                      <Table.Cell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(u)}
                            className="p-1.5 rounded-[5px] text-slate-400 hover:text-[#126973] hover:bg-[#126973]/10 dark:hover:text-[#F1D8C2] transition-all cursor-pointer"
                            title="Edit Account"
                          >
                            <Edit01 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(u.id)}
                            className="p-1.5 rounded-[5px] text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                            title="Deactivate Account"
                          >
                            <Trash01 size={15} />
                          </button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )
                }}
              </Table.Body>
            </Table>

            {/* Pagination */}
            <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <PaginationPageMinimalCenter
                page={page}
                total={totalPages}
                onPageChange={setPage}
              />
            </div>
          </TableCard.Root>
        </div>
      )}
    </AdminLayout>
  )
}
