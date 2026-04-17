import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

export default function Auth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const { login } = useAuthStore()
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [focusedField, setFocusedField] = useState(null)

  const validate = () => {
    const e = {}
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required'
    if (form.password.length < 6) e.password = 'Min 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const res = login(form.email, form.password)
    if (res.success) { toast.success('Welcome back!'); navigate(redirect) }
    else { toast.error(res.message); setErrors({ email: res.message }) }
    setLoading(false)
  }

  const borderColor = (field) => {
    if (errors[field]) return 'var(--error)'
    if (focusedField === field) return 'var(--primary)'
    return 'var(--border)'
  }

  const Field = ({ id, label, type = 'text', icon: Icon, value, error, placeholder }) => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6, color: 'var(--text)' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />}
        <input
          type={type === 'password' ? (showPwd ? 'text' : 'password') : type}
          value={value}
          placeholder={placeholder}
          onChange={e => { setForm(p => ({ ...p, [id]: e.target.value })); setErrors(p => ({ ...p, [id]: '' })) }}
          onFocus={() => setFocusedField(id)}
          onBlur={() => setFocusedField(null)}
          style={{
            width: '100%',
            padding: `10px 12px 10px ${Icon ? '38px' : '12px'}`,
            border: `1.5px solid ${borderColor(id)}`,
            borderRadius: 8, fontSize: 14, outline: 'none',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box',
          }}
        />
        {type === 'password' && (
          <button type="button" onClick={() => setShowPwd(!showPwd)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>{error}</p>}
    </div>
  )

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: 'var(--bg-secondary)' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow-lg)', padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🛍️</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Admin Login</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
            Enter your credentials to access the admin panel
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Field id="email" label="Email Address" type="email" icon={Mail} value={form.email} error={errors.email} placeholder="admin@store.com" />
          <Field id="password" label="Password" type="password" icon={Lock} value={form.password} error={errors.password} placeholder="Your password" />

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '13px', background: loading ? '#ccc' : 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', marginTop: 8 }}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
