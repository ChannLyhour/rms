import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { CreateButton } from '../../components/common/ButtonComponent'
import { adminApi } from '../../api/adminApi'
import { Plus, Pencil, Trash2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLE_CONFIG = {
  admin:   { label: 'Administrator', bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', dot: 'bg-red-500' },
  cashier: { label: 'Cashier',       bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
  kitchen: { label: 'Kitchen Staff', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', dot: 'bg-amber-500' },
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', role_id: 2 })

  useEffect(() => {
    adminApi.getUsers().then(({ data }) => setUsers(data.data || []))
  }, [])

  const openCreate = () => { setForm({ name: '', username: '', email: '', password: '', role_id: 2 }); setModal('create') }
  const openEdit = (u) => { setForm({ name: u.name, username: u.username, email: u.email || '', password: '', role_id: u.role_id }); setModal(u) }

  const handleSave = async () => {
    try {
      if (modal === 'create') {
        const { data } = await adminApi.createUser(form)
        setUsers((prev) => [...prev, data])
        toast.success('User account created')
      } else {
        const payload = { ...form }
        if (!payload.password) delete payload.password
        await adminApi.updateUser(modal.id, payload)
        setUsers((prev) => prev.map((u) => u.id === modal.id ? { ...u, ...payload } : u))
        toast.success('User account updated')
      }
      setModal(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this user account?')) return
    await adminApi.deleteUser(id)
    setUsers((prev) => prev.filter((u) => u.id !== id))
    toast.success('User deactivated')
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h1
              className="text-xl font-extrabold tracking-tight"
              style={{ color: 'var(--color-text)' }}
            >
              Staff & User Management
            </h1>
           
          </div>
          <CreateButton
            label="Add User"
            onClick={openCreate}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => {
            const roleKey = u.role?.name || 'cashier'
            const roleConf = ROLE_CONFIG[roleKey] || ROLE_CONFIG.cashier

            return (
              <div
                key={u.id}
                className="rounded-2xl p-5 border flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
                style={{
                  background: 'var(--color-card)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0"
                        style={{ background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-700, #8A2E2E))' }}
                      >
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="font-bold text-sm truncate"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {u.name}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: 'var(--color-muted)' }}
                        >
                          @{u.username}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shrink-0 ${roleConf.bg} ${roleConf.text} ${roleConf.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${roleConf.dot}`} />
                      {roleConf.label}
                    </span>
                  </div>

                  <p
                    className="text-xs mb-4 truncate"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {u.email || 'No email associated'}
                  </p>
                </div>

                <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <button
                    onClick={() => openEdit(u)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-colors hover:opacity-80"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    <Pencil size={12} /> Edit Account
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="p-2 rounded-xl border transition-colors hover:text-red-500 hover:bg-red-500/10"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-muted)'
                    }}
                    title="Deactivate"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Modal */}
        {modal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
              className="rounded-3xl p-6 w-full max-w-md border shadow-2xl space-y-4"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)'
              }}
            >
              <div className="border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
                <h2
                  className="text-base font-bold"
                  style={{ color: 'var(--color-text)' }}
                >
                  {modal === 'create' ? 'Create New Staff Account' : 'Edit Staff Account'}
                </h2>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Configure credentials and assign system role
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Full Name', key: 'name', placeholder: 'e.g. John Doe' },
                  { label: 'Username', key: 'username', placeholder: 'e.g. jdoe' },
                  { label: 'Email', key: 'email', placeholder: 'e.g. staff@example.com' },
                  { label: modal === 'create' ? 'Password' : 'New Password (leave blank to keep)', key: 'password', type: 'password', placeholder: '••••••••' },
                ].map(({ label, key, type = 'text', placeholder }) => (
                  <div key={key}>
                    <label
                      className="text-xs font-medium block mb-1.5"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {label}
                    </label>
                    <input
                      type={type}
                      value={form[key]}
                      placeholder={placeholder}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition-colors"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)'
                      }}
                    />
                  </div>
                ))}
                <div>
                  <label
                    className="text-xs font-medium block mb-1.5"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Assign Role
                  </label>
                  <select
                    value={form.role_id}
                    onChange={(e) => setForm({ ...form, role_id: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition-colors"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                  >
                    <option value={1}>Administrator</option>
                    <option value={2}>Cashier</option>
                    <option value={3}>Kitchen Staff</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setModal(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-colors hover:opacity-80"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))' }}
                >
                  Save User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
