import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { api } from '../utils/api'
import toast from 'react-hot-toast'

// ── Forgot / Reset Password Page ──────────────────────────────
// /forgot-password       → shows email form
// /reset-password?token= → shows new password form (token comes from email link)

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  // Step 1: request reset link (no token in URL)
  if (!token) return <ForgotPasswordForm />

  // Step 2: set new password (token in URL from email link)
  return <SetNewPasswordForm token={token} navigate={navigate} />
}

// ── Step 1: Enter email ───────────────────────────────────────
function ForgotPasswordForm() {
  const [email, setEmail] = useState('rrsenterprises2026@gmail.com')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Please enter a valid email'); return
    }
    setLoading(true)
    await api.forgotPassword(email)
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Check your email</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
              If <strong>{email}</strong> is a registered admin email, a password reset link has been sent to <strong>rrsenterprises2026@gmail.com</strong>.
            </p>
            <p style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>The link expires in 15 minutes.</p>
          </div>
          <Link to="/login" style={linkBtnStyle}>
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Forgot Password</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
            Enter your admin email and we'll send a reset link to the registered owner email.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Admin Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="rrsenterprises2026@gmail.com"
                style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '13px', background: loading ? '#ccc' : 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>

        <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>
          <ArrowLeft size={13} /> Back to Login
        </Link>
      </div>
    </div>
  )
}

// ── Step 2: Set new password ──────────────────────────────────
function SetNewPasswordForm({ token, navigate }) {
  const [form, setForm] = useState({ newPw: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)

  // Pre-validate token on mount (optional — backend validates on submit anyway)
  useEffect(() => {
    setValidating(false)
    setTokenValid(true) // optimistic — show form, error shown on submit if invalid
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.newPw.length < 6) { setError('Minimum 6 characters'); return }
    if (form.newPw !== form.confirm) { setError('Passwords do not match'); return }

    setLoading(true)
    const result = await api.resetPassword(token)
    if (!result) {
      setError('Could not connect to server. Please try again.')
      setLoading(false); return
    }
    if (!result.success) {
      setError(result.error || 'Invalid or expired reset link')
      setLoading(false); return
    }

    // Save new password locally (admin-pw in localStorage)
    localStorage.setItem('admin-pw', form.newPw)
    toast.success('Password reset! You can now log in with your new password.')
    navigate('/login')
  }

  if (validating) {
    return <div style={{ textAlign: 'center', padding: '80px 20px' }}><p>Validating link…</p></div>
  }

  return (
    <div style={wrapStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔑</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Set New Password</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Choose a strong new password for your admin account.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {[{ key: 'newPw', label: 'New Password' }, { key: 'confirm', label: 'Confirm Password' }].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{f.label}</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '10px 38px 10px 38px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
                {f.key === 'newPw' && (
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {error && (
            <p style={{ fontSize: 12, color: 'var(--error)', marginBottom: 12 }}>{error}</p>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '13px', background: loading ? '#ccc' : 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Saving…' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────
const wrapStyle = {
  minHeight: '80vh', display: 'flex', alignItems: 'center',
  justifyContent: 'center', padding: '24px 16px', background: 'var(--bg-secondary)',
}
const cardStyle = {
  width: '100%', maxWidth: 420, background: '#fff',
  borderRadius: 16, boxShadow: 'var(--shadow-lg)', padding: '40px 32px',
}
const labelStyle = {
  fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6, color: 'var(--text)',
}
const linkBtnStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  padding: '10px', background: 'var(--bg-secondary)', color: 'var(--text)',
  border: '1.5px solid var(--border)', borderRadius: 8, textDecoration: 'none',
  fontSize: 14, fontWeight: 500,
}
