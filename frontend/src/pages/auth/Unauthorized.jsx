import { useNavigate } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'

export default function Unauthorized() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--color-bg)' }}>
      <ShieldOff size={48} style={{ color: 'var(--color-danger)' }} />
      <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Access Denied</h1>
      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>You do not have permission to view this page.</p>
      <button
        onClick={() => navigate(-1)}
        className="mt-2 px-5 py-2 rounded-lg text-sm font-medium text-white"
        style={{ background: 'var(--color-accent)' }}
      >
        Go Back
      </button>
    </div>
  )
}
