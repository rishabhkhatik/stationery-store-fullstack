import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, Tag, ArrowRight, ShieldCheck, X } from 'lucide-react'
import { useCartStore, useAuthStore, useAdminStore } from '../store'
import { sendOrderNotification } from '../utils/notifications'
import { api } from '../utils/api'
import toast from 'react-hot-toast'

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'

function loadRecaptcha() {
  if (document.getElementById('recaptcha-script')) return
  const s = document.createElement('script')
  s.id = 'recaptcha-script'
  s.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`
  s.async = true
  document.head.appendChild(s)
}

export default function Cart() {
  const { items, removeItem, updateQty, clearCart, applyPromo, promoCode, getTotal } = useCartStore()
  const { user } = useAuthStore()
  const { addOrder, siteConfig, coupons } = useAdminStore()
  const navigate = useNavigate()
  const [promo, setPromo] = useState('')
  const [step, setStep] = useState('cart')
  const [orderData, setOrderData] = useState(null)
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', address: '', city: '', pincode: '', notes: '' })
  const [placing, setPlacing] = useState(false)

  useEffect(() => { loadRecaptcha() }, [])

  useEffect(() => {
    // If user removes all items during checkout, go back to cart view
    if (step === 'checkout' && items.length === 0) setStep('cart')
  }, [items.length, step])

  const { subtotal, discount, total } = getTotal()

  const handlePromo = () => {
    const result = applyPromo(promo, coupons || [])
    if (result.success) toast.success('Promo code applied!')
    else toast.error(result.message)
  }

  const handlePlaceOrder = async () => {
    if (!form.name || !form.phone || !form.address || !form.city || !form.pincode) {
      toast.error('Please fill all required fields'); return
    }
    setPlacing(true)
    try {
      const token = await new Promise((resolve, reject) => {
        if (!window.grecaptcha) { reject(new Error('reCAPTCHA not loaded')); return }
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'checkout' }).then(resolve).catch(reject)
        })
      })
      const captchaResult = await api.verifyCaptcha(token)
      if (!captchaResult?.success) {
        toast.error('Security check failed. Please try again.')
        setPlacing(false)
        return
      }
    } catch {
      toast.error('Security verification failed. Please refresh and try again.')
      setPlacing(false)
      return
    }
    const order = {
      id: 'ORD-' + Date.now(),
      items: [...items],
      customer: { ...form, userId: user?.id },
      subtotal, discount, total, promoCode,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    }
    addOrder(order)
    await sendOrderNotification(order, siteConfig)
    clearCart()
    setOrderData(order)
    setStep('success')
    setPlacing(false)
  }

  if (step === 'success' && orderData) {
    return (
      <div className="container" style={{ padding: '40px 16px', maxWidth: 600, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'var(--success)' }}>Order Placed Successfully!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Your order <strong>{orderData.id}</strong> has been placed. We'll contact you shortly.</p>
        <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 20, textAlign: 'left', marginBottom: 24 }}>
          <h4 style={{ marginBottom: 12 }}>Order Summary</h4>
          {orderData.items.map(i => (
            <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
              <span>{i.name} × {i.qty}</span><span>₹{i.price * i.qty}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
            <span>Total</span><span>₹{orderData.total}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-outline">Continue Shopping</Link>
          <Link to="/orders" className="btn btn-primary">My Orders</Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
        <h2 style={{ marginBottom: 8 }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Add some products to get started!</p>
        <Link to="/categories" className="btn btn-primary">Shop Now</Link>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>{step === 'cart' ? '🛒 Your Cart' : '📋 Checkout'}</h1>

      {step === 'cart' && (
        <div className="cart-grid">
          {/* Items */}
          <div>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 12, padding: 16, background: '#fff', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 12, flexWrap: 'wrap' }}>
                <img src={item.image} alt={item.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                  onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x80?text=No+Image' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.name}</h4>
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', marginBottom: 10 }}>₹{item.price}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                      <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', border: 'none', cursor: 'pointer' }}><Minus size={12} /></button>
                      <span style={{ width: 36, textAlign: 'center', fontSize: 14, fontWeight: 600 }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', border: 'none', cursor: 'pointer' }}><Plus size={12} /></button>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>₹{item.price * item.qty}</span>
                    <button onClick={() => removeItem(item.id)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary sidebar */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: 20, alignSelf: 'start' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
              <span>Subtotal ({items.length} items)</span><span>₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8, color: 'var(--success)' }}>
                <span>Discount ({promoCode})</span><span>−₹{discount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8, color: 'var(--success)' }}>
              <span>Delivery</span><span style={{ fontWeight: 600 }}>FREE</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18 }}>
              <span>Total</span><span>₹{total}</span>
            </div>
            {!promoCode && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={promo} onChange={e => setPromo(e.target.value.toUpperCase())} placeholder="Promo code"
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
                  <button onClick={handlePromo} style={{ padding: '8px 14px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                    <Tag size={14} />
                  </button>
                </div>

              </div>
            )}
            <button onClick={() => setStep('checkout')} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              Proceed to Checkout <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 'checkout' && (
        <div className="cart-grid">
          {/* Delivery form */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Delivery Details</h3>
            <div className="checkout-form-grid">
              {[
                { key: 'name', label: 'Full Name *', type: 'text', full: false },
                { key: 'phone', label: 'Phone Number *', type: 'tel', full: false },
                { key: 'email', label: 'Email Address *', type: 'email', full: true },
                { key: 'address', label: 'Full Address *', type: 'text', full: true },
                { key: 'city', label: 'City *', type: 'text', full: false },
                { key: 'pincode', label: 'Pincode *', type: 'text', full: false },
                { key: 'notes', label: 'Order Notes (optional)', type: 'text', full: true },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.full ? 'span 2' : 'span 1' }} className={f.full ? 'full-col' : ''}>
                  <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <ShieldCheck size={16} color="var(--success)" />
                <span style={{ fontSize: 13, fontWeight: 500 }}>Security Verification</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                This checkout is protected by reCAPTCHA v3. Verification runs automatically when you place your order.
              </p>
              <p style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>
                Protected by reCAPTCHA —{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#aaa' }}>Privacy Policy</a>
                {' & '}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#aaa' }}>Terms</a>
              </p>
            </div>
          </div>

          {/* Summary + Place Order */}
          <div>
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: 20, marginBottom: 16 }}>
              <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Order Summary</h4>
              {items.map(i => (
                <div key={i.id} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                  <img src={i.image} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{i.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>×{i.qty} = ₹{i.price * i.qty}</p>
                  </div>
                  <button onClick={() => removeItem(i.id)}
                    title="Remove item"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '2px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>Cart is empty</p>
              )}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Total</span><span>₹{total}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setStep('cart'); setCaptchaDone(false) }} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Back</button>
              <button onClick={handlePlaceOrder} disabled={placing} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '12px', opacity: placing ? 0.7 : 1 }}>
                {placing ? 'Placing…' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bug #4: Mobile responsive styles */}
      <style>{`
        .cart-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 24px;
          align-items: start;
        }
        .checkout-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 768px) {
          .cart-grid {
            grid-template-columns: 1fr !important;
          }
          .checkout-form-grid {
            grid-template-columns: 1fr !important;
          }
          .full-col, .checkout-form-grid > div {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </div>
  )
}
