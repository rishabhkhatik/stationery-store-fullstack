import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, MessageCircle, Send } from 'lucide-react'
import { useAdminStore, useAuthStore } from '../store'
import toast from 'react-hot-toast'

export function ContactPage() {
  const siteConfig = useAdminStore(state => state.siteConfig)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all required fields'); return }
    if (siteConfig.whatsappNumber) {
      const msg = `*Contact Form Enquiry*\n\nName: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\nMessage:\n${form.message}`
      window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank')
    }
    setSent(true)
    toast.success('Message sent!')
  }

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary), #c2307a)', padding: '48px 16px', textAlign: 'center', color: '#fff' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Contact Us</h1>
        <p style={{ opacity: 0.9 }}>We're here to help — reach out anytime</p>
      </div>
      <div className="container" style={{ padding: '48px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Get In Touch</h2>
            {[
              { icon: MapPin, label: 'Address', value: siteConfig.address },
              { icon: Phone, label: 'Phone', value: siteConfig.contactPhone },
              { icon: Mail, label: 'Email', value: siteConfig.contactEmail },
            ].map(({ icon: Icon, label, value }) => value && (
              <div key={label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color="var(--primary)" />
                </div>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{value}</p>
                </div>
              </div>
            ))}
            {siteConfig.whatsappNumber && (
              <a href={`https://wa.me/${siteConfig.whatsappNumber}`} target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25d366', color: '#fff', padding: '10px 20px', borderRadius: 30, fontSize: 14, fontWeight: 600, marginTop: 8, textDecoration: 'none' }}>
                <MessageCircle size={16} /> Chat on WhatsApp
              </a>
            )}
          </div>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: 28 }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <h3>Message Sent!</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>We'll get back to you shortly.</p>
                <button onClick={() => setSent(false)} className="btn btn-outline" style={{ marginTop: 16 }}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Send a Message</h3>
                {[
                  { key: 'name', label: 'Your Name *', type: 'text' },
                  { key: 'email', label: 'Email Address *', type: 'email' },
                  { key: 'subject', label: 'Subject', type: 'text' },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>{f.label}</label>
                    <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                ))}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Message *</label>
                  <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={4}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical' }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
                  <Send size={14} /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function OrdersPage() {
  const user = useAuthStore(state => state.user)
  const orders = useAdminStore(state => state.orders)
  const myOrders = orders.filter(o => o.customer?.userId === user?.id || o.customer?.email === user?.email)
  const statusColors = { Pending: '#f59e0b', Packed: '#3b82f6', Shipped: '#8b5cf6', Delivered: '#22c55e', Cancelled: '#ef4444' }

  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>My Orders</h1>
      {myOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 48 }}>📦</p>
          <h3 style={{ marginTop: 12 }}>No orders yet</h3>
          <Link to="/categories" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {myOrders.map(order => (
            <div key={order.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{order.id}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <span style={{ background: statusColors[order.status] + '20', color: statusColors[order.status], padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{order.status}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {order.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)', padding: '6px 10px', borderRadius: 8 }}>
                    <img src={item.image} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }} onError={e => e.target.style.display = 'none'} />
                    <span style={{ fontSize: 13 }}>{item.name} ×{item.qty}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>₹{order.total}</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{order.items.length} item(s)</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PolicyPage({ title, content }) {
  return (
    <div className="container" style={{ padding: '40px 16px', maxWidth: 800 }}>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        <Link to="/">Home</Link> / <span style={{ color: 'var(--text)' }}>{title}</span>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>{title}</h1>
      <div style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>{content}</div>
    </div>
  )
}

export function TermsPage() {
  const siteConfig = useAdminStore(state => state.siteConfig)
  return <PolicyPage title="Terms & Conditions" content={siteConfig.termsContent || 'By using our website, you agree to these terms and conditions. All products are subject to availability. Prices may change without notice. Orders once placed cannot be modified. We reserve the right to cancel any order.'} />
}
export function PrivacyPage() {
  const siteConfig = useAdminStore(state => state.siteConfig)
  return <PolicyPage title="Privacy Policy" content={siteConfig.privacyContent || 'We collect your name, email, phone and address only to process your orders. We do not share your data with third parties. Your information is stored securely.'} />
}
export function RefundPage() {
  const siteConfig = useAdminStore(state => state.siteConfig)
  return <PolicyPage title="Return & Refund Policy" content={siteConfig.refundContent || 'Returns accepted within 7 days of delivery for damaged or incorrect items. Contact us with order ID and photos. Refunds processed within 5-7 business days.'} />
}
export function ShippingPage() {
  const siteConfig = useAdminStore(state => state.siteConfig)
  return <PolicyPage title="Shipping Policy" content={siteConfig.shippingContent || 'We ship across India. Standard delivery in 5-7 business days. Free shipping on all orders. Express delivery available in select cities.'} />
}
