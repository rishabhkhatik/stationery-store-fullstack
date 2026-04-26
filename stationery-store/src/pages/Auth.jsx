import React, { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Phone } from 'lucide-react'
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

  // Is the user entering a phone number?
  const isPhone = /^[6-9]\d{0,9}$/.test(form.email.trim())

  const validate = () => {
    const e = {}
    // Allow phone number OR email
    const isValidEmail = form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    const isValidPhone = /^[6-9]\d{9}$/.test(form.email.trim())
    if (!isValidEmail && !isValidPhone) e.email = 'Enter a valid email or registered phone number'
    // Password only required for admin login (email-based)
    if (isValidEmail && !isPhone && form.password.length < 6) e.password = 'Min 6 characters'
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

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: 'var(--bg-secondary)' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow-lg)', padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🛍️</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Welcome Back</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
            Admin: use your email &amp; password<br />
            <span style={{ color: 'var(--primary)', fontWeight: 500 }}>Customers: enter your registered phone number — no password needed</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email / Phone field */}
          <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6, color: 'var(--text)' }}>Email or Phone Number</label>
            <div style={{ position: 'relative' }}>
              {isPhone
                ? <Phone size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                : <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              }
              <input
                type="text"
                value={form.email}
                placeholder="Phone number or admin email"
                onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })) }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                style={{ width: '100%', padding: '10px 12px 10px 38px', border: `1.5px solid ${borderColor('email')}`, borderRadius: 8, fontSize: 14, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
              />
            </div>
            {errors.email && <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>{errors.email}</p>}
          </div>

          {/* Password — hidden for phone-based customer login */}
          {!isPhone && (
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6, color: 'var(--text)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                placeholder="Your password"
                onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })) }}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                style={{ width: '100%', padding: '10px 38px 10px 38px', border: `1.5px solid ${borderColor('password')}`, borderRadius: 8, fontSize: 14, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>{errors.password}</p>}
          </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '13px', background: loading ? '#ccc' : 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', marginTop: 8 }}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  )
}
