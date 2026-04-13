import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

export default function Auth({ mode = 'login' }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const { login, register } = useAuthStore()
  const [isLogin, setIsLogin] = useState(mode === 'login')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!isLogin && !form.name.trim()) e.name = 'Name is required'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required'
    if (!isLogin && !form.phone.match(/^[6-9]\d{9}$/)) e.phone = 'Valid 10-digit phone required'
    if (form.password.length < 6) e.password = 'Min 6 characters'
    if (!isLogin && form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    if (isLogin) {
      const res = login(form.email, form.password)
      if (res.success) { toast.success('Welcome back!'); navigate(redirect) }
      else { toast.error(res.message); setErrors({ email: res.message }) }
    } else {
      const res = register(form)
      if (res.success) { toast.success('Account created! Welcome!'); navigate(redirect) }
      else { toast.error(res.message); setErrors({ email: res.message }) }
    }
    setLoading(false)
  }

  const F = ({ id, label, type = 'text', icon: Icon, value, error, placeholder }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6, color: 'var(--text)' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />}
        <input
          type={type === 'password' ? (showPwd ? 'text' : 'password') : type}
          value={value}
          placeholder={placeholder}
          onChange={e => { setForm(p => ({ ...p, [id]: e.target.value })); setErrors(p => ({ ...p, [id]: '' })) }}
          style={{ width: '100%', padding: `10px 12px 10px ${Icon ? '38px' : '12px'}`, border: `1.5px solid ${error ? 'var(--error)' : 'var(--border)'}`, borderRadius: 8, fontSize: 14, outline: 'none', transition: 'border 0.2s' }}
          onFocus={e => e.target.style.borderColor = 'var(--primary)'}
          onBlur={e => e.target.style.borderColor = error ? 'var(--error)' : 'var(--border)'}
        />
        {type === 'password' && (
          <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>{error}</p>}
    </div>
  )

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: 'var(--bg-secondary)' }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow-lg)', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <User size={24} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {isLogin ? 'Login to access your cart and orders' : 'Register to start shopping'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && <F id="name" label="Full Name *" icon={User} value={form.name} error={errors.name} placeholder="Your full name" />}
          <F id="email" label="Email Address *" type="email" icon={Mail} value={form.email} error={errors.email} placeholder="you@email.com" />
          {!isLogin && <F id="phone" label="Phone Number *" type="tel" icon={Phone} value={form.phone} error={errors.phone} placeholder="10-digit mobile number" />}
          <F id="password" label="Password *" type="password" icon={Lock} value={form.password} error={errors.password} placeholder="Min 6 characters" />
          {!isLogin && <F id="confirm" label="Confirm Password *" type="password" icon={Lock} value={form.confirm} error={errors.confirm} placeholder="Re-enter password" />}

          {isLogin && (
            <div style={{ textAlign: 'right', marginBottom: 16, marginTop: -8 }}>
              <span style={{ fontSize: 13, color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}>Forgot password?</span>
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '12px', background: loading ? '#ccc' : 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', marginTop: 4 }}>
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, marginTop: 20, color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setIsLogin(!isLogin); setErrors({}) }}
            style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>

        {isLogin && (
          <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            Admin login: <strong>admin@store.com</strong> / <strong>admin123</strong>
          </div>
        )}
      </div>
    </div>
  )
}
