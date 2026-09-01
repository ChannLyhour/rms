import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { Settings as SettingsIcon, Save, Store, Receipt, Percent, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/adminApi'

export default function Settings() {
  const [settings, setSettings] = useState({
    storeName: 'exView Bistro & Grill',
    taxRate: '7',
    currencySymbol: '$',
    receiptHeader: 'Thank you for dining with us!',
    receiptFooter: 'Wi-Fi: exView-Guest | Pass: delicious2026',
    autoCloseSessions: 'true',
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch settings from API or localStorage
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      try {
        const savedLocal = localStorage.getItem('pos_system_settings')
        if (savedLocal) {
          try {
            setSettings((prev) => ({ ...prev, ...JSON.parse(savedLocal) }))
          } catch (e) {}
        }

        const res = await adminApi.getSettings()
        const data = res.data?.data || res.data || []
        if (Array.isArray(data) && data.length > 0) {
          const map = {}
          data.forEach((s) => {
            if (s.key === 'store_name') map.storeName = s.value
            if (s.key === 'tax_rate') map.taxRate = s.value
            if (s.key === 'currency_symbol') map.currencySymbol = s.value
            if (s.key === 'receipt_header') map.receiptHeader = s.value
            if (s.key === 'receipt_footer') map.receiptFooter = s.value
            if (s.key === 'auto_close_sessions') map.autoCloseSessions = s.value
          })
          setSettings((prev) => ({ ...prev, ...map }))
          localStorage.setItem('pos_system_settings', JSON.stringify({ ...settings, ...map }))
          if (map.taxRate) localStorage.setItem('pos_tax_rate', String(map.taxRate))
        }
      } catch (err) {
        console.error('Error fetching settings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Save to localStorage immediately
      localStorage.setItem('pos_system_settings', JSON.stringify(settings))
      localStorage.setItem('pos_tax_rate', String(settings.taxRate))

      // Save to Backend API
      const promises = [
        adminApi.setSetting({ key: 'store_name', value: settings.storeName }),
        adminApi.setSetting({ key: 'tax_rate', value: String(settings.taxRate) }),
        adminApi.setSetting({ key: 'currency_symbol', value: settings.currencySymbol }),
        adminApi.setSetting({ key: 'receipt_header', value: settings.receiptHeader }),
        adminApi.setSetting({ key: 'receipt_footer', value: settings.receiptFooter }),
        adminApi.setSetting({ key: 'auto_close_sessions', value: String(settings.autoCloseSessions) }),
      ]
      await Promise.allSettled(promises)

      // Notify other components/tabs in real-time
      window.dispatchEvent(new Event('pos_settings_changed'))

      toast.success('System & Tax settings saved successfully')
    } catch (err) {
      toast.error('Failed to save settings to server, saved locally.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b pb-5" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>
              Store & System Settings
            </h1>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Store Info */}
          <div
            className="rounded-3xl p-6 border shadow-sm space-y-4"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <Store size={18} className="text-red-500" />
              <h2 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                Restaurant Branding & Identity
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Store / Restaurant Name
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none"
                  style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={settings.currencySymbol}
                  onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none font-mono"
                  style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
            </div>
          </div>

          {/* Tax & Financials */}
          <div
            className="rounded-3xl p-6 border shadow-sm space-y-4"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <Percent size={18} className="text-emerald-500" />
              <h2 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                Taxation & Checkout Calculations
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  VAT / Sales Tax (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold border outline-none"
                  style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
                <span className="text-[10px] mt-1 block" style={{ color: 'var(--color-muted)' }}>
                  Applied automatically at checkout in Cashier POS.
                </span>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Auto-Close Completed Sessions
                </label>
                <select
                  value={settings.autoCloseSessions}
                  onChange={(e) => setSettings({ ...settings, autoCloseSessions: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none"
                  style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  <option value="true">Enabled (Auto release table on full payment)</option>
                  <option value="false">Disabled (Manual table release by staff)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Receipt Customizer */}
          <div
            className="rounded-3xl p-6 border shadow-sm space-y-4"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <Receipt size={18} className="text-blue-500" />
              <h2 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                Thermal Receipt Notes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Receipt Header Welcome Message
                </label>
                <input
                  type="text"
                  value={settings.receiptHeader}
                  onChange={(e) => setSettings({ ...settings, receiptHeader: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none"
                  style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Receipt Footer & Wi-Fi Password Note
                </label>
                <input
                  type="text"
                  value={settings.receiptFooter}
                  onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none"
                  style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white shadow-xl transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--color-500, #BF4040), var(--color-600, #9D3434))' }}
            >
              <Save size={14} /> {saving ? 'Saving Settings...' : 'Save System Settings'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
