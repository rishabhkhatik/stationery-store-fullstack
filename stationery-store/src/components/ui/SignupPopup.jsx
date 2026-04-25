import React, { useState } from 'react'
import { X, User, Phone, MapPin, Mail, ShoppingCart } from 'lucide-react'
import { useAuthStore } from '../../store'
import toast from 'react-hot-toast'

export default function SignupPopup({ onClose, onSuccess }) {
  const { addUser } = useAuthStore()
  const [form, setForm] = useState({ name: '', phone: '', address: '', email: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.phone.match(/^[6-9]\d{9}$/)) e.phone = 'Enter valid 10-digit mobile number'
    if (!form.address.trim()) e.address = 'Address is required'
    if (form.email && !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter valid email'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await addUser({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        email: form.email.trim() || null,
      })
      toast.success(`Welcome, ${form.name.split(' ')[0]}! 🎉`)
      onSuccess?.()
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const inputStyle = (field) => ({
    width: '100%',
    padding: '10px 12px 10px 38px',
    border: `1.5px solid ${errors[field] ? 'var(--error)' : 'var(--border)'}`,
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  })

  const iconStyle = {
    position: 'absolute', left: 12, top: '50%',
    transform: 'translateY(-50%)', color: 'var(--text-muted)',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '16px',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16,
        width: '100%', maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), #c2307a)',
          padding: '24px 24px 20px',
          position: 'relative',
        }}>
          <button onClick={onClose}
            style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <X size={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingCart size={22} color="#fff" />
            <div>
              <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>Quick Signup</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, margin: '3px 0 0' }}>Enter your details to continue shopping</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Full Name *</label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={iconStyle} />
              <input
                type="text"
                value={form.name}
                placeholder="Your full name"
                onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })) }}
                style={inputStyle('name')}
              />
            </div>
            {errors.name && <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>{errors.name}</p>}
          </div>

          {/* Phone */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Mobile Number *</label>
            <div style={{ position: 'relative' }}>
              <Phone size={15} style={iconStyle} />
              <input
                type="tel"
                value={form.phone}
                placeholder="10-digit mobile number"
                onChange={e => { setForm(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: '' })) }}
                style={inputStyle('phone')}
              />
            </div>
            {errors.phone && <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>{errors.phone}</p>}
          </div>

          {/* Address */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Delivery Address *</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={15} style={{ ...iconStyle, top: 14, transform: 'none' }} />
              <textarea
                value={form.address}
                placeholder="House no., street, city, pincode"
                rows={2}
                onChange={e => { setForm(p => ({ ...p, address: e.target.value })); setErrors(p => ({ ...p, address: '' })) }}
                style={{ ...inputStyle('address'), padding: '10px 12px 10px 38px', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
            {errors.address && <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>{errors.address}</p>}
          </div>

          {/* Email (optional) */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Email Address <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={iconStyle} />
              <input
                type="email"
                value={form.email}
                placeholder="For order updates"
                onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })) }}
                style={inputStyle('email')}
              />
            </div>
            {errors.email && <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>{errors.email}</p>}
          </div>

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: loading ? '#ccc' : 'var(--primary)',
              color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            <ShoppingCart size={16} />
            {loading ? 'Saving…' : 'Continue to Cart'}
          </button>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
            Already signed up?{' '}
            <a href="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Admin Login</a>
          </p>
        </form>
      </div>
    </div>
  )
}
