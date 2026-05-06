import React, { useState } from 'react'
import { X, Upload, CheckCircle, MessageCircle, Package } from 'lucide-react'
import { useAdminStore } from '../../store'
import { sendWhatsAppNotification } from '../../utils/notifications'
import toast from 'react-hot-toast'

/*
  OrderPopup — shown when user clicks "Order Now" on a product.
  Flow: Fill details → Show QR → Upload screenshot → Thank you
*/
export default function OrderPopup({ product, quantity = 1, onClose }) {
  const siteConfig = useAdminStore(state => state.siteConfig)
  const addOrder = useAdminStore(state => state.addOrder)
  const [step, setStep] = useState('form')   // form | qr | done
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [qty, setQty] = useState(quantity)
  const [screenshot, setScreenshot] = useState(null)
  const [screenshotPreview, setScreenshotPreview] = useState(null)
  const [errors, setErrors] = useState({})

  const total = product.price * qty

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.phone.match(/^[6-9]\d{9}$/)) e.phone = 'Valid 10-digit phone required'
    if (!form.address.trim()) e.address = 'Address is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    setStep('qr')
  }

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setScreenshot(ev.target.result)
      setScreenshotPreview(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleConfirmOrder = () => {
    if (!screenshot) { toast.error('Please upload payment screenshot to confirm order'); return }

    const order = {
      id: 'ORD-' + Date.now(),
      items: [{ ...product, qty }],
      customer: { name: form.name, phone: form.phone, address: form.address },
      subtotal: total, discount: 0, total,
      status: 'Pending',
      paymentScreenshot: screenshot,
      createdAt: new Date().toISOString(),
    }
    addOrder(order)

    // WhatsApp notification
    if (siteConfig.notifyWhatsapp !== false && siteConfig.whatsappNumber) {
      sendWhatsAppNotification(order, siteConfig.whatsappNumber)
    }

    setStep('done')
  }

  const inputStyle = (field) => ({
    width: '100%', padding: '10px 12px',
    border: `1.5px solid ${errors[field] ? 'var(--error)' : 'var(--border)'}`,
    borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
  })

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '16px',
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
          <h2 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>
            {step === 'form' ? '🛍️ Quick Order' : step === 'qr' ? '💳 Make Payment' : '🎉 Order Placed!'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {/* STEP 1: Fill Details */}
          {step === 'form' && (
            <>
              {/* Product summary */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: 10, padding: 12, marginBottom: 20 }}>
                <img src={product.image} alt={product.name}
                  style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                  onError={e => e.target.style.display = 'none'} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{product.name}</p>
                  <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>₹{product.price} each</p>
                </div>
                {/* Qty control */}
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    style={{ width: 30, height: 30, background: '#f5f5f5', border: 'none', cursor: 'pointer', fontSize: 16 }}>−</button>
                  <span style={{ width: 34, textAlign: 'center', fontWeight: 600, fontSize: 14 }}>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)}
                    style={{ width: 30, height: 30, background: '#f5f5f5', border: 'none', cursor: 'pointer', fontSize: 16 }}>+</button>
                </div>
              </div>

              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
                <span>Total</span><span style={{ color: 'var(--primary)' }}>₹{total}</span>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Your Name *</label>
                  <input value={form.name} onChange={e => { setForm(p => ({...p, name: e.target.value})); setErrors(p => ({...p, name: ''})) }}
                    placeholder="Full name" style={inputStyle('name')} />
                  {errors.name && <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 3 }}>{errors.name}</p>}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Mobile Number *</label>
                  <input type="tel" value={form.phone} onChange={e => { setForm(p => ({...p, phone: e.target.value})); setErrors(p => ({...p, phone: ''})) }}
                    placeholder="10-digit mobile number" style={inputStyle('phone')} />
                  {errors.phone && <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 3 }}>{errors.phone}</p>}
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Delivery Address *</label>
                  <textarea value={form.address} onChange={e => { setForm(p => ({...p, address: e.target.value})); setErrors(p => ({...p, address: ''})) }}
                    placeholder="Full delivery address with city and pincode" rows={3}
                    style={{ ...inputStyle('address'), resize: 'vertical' }} />
                  {errors.address && <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 3 }}>{errors.address}</p>}
                </div>
                <button type="submit" style={{ width: '100%', padding: '13px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                  Proceed to Payment →
                </button>
              </form>
            </>
          )}

          {/* STEP 2: QR + Screenshot */}
          {step === 'qr' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Please scan the QR code below and pay <strong style={{ color: 'var(--primary)', fontSize: 16 }}>₹{total}</strong>
                </p>

                {/* QR code from admin settings */}
                {siteConfig.paymentQrCode ? (
                  <div style={{ display: 'inline-block', padding: 12, border: '2px solid var(--primary)', borderRadius: 12, marginBottom: 16 }}>
                    <img src={siteConfig.paymentQrCode} alt="Payment QR Code"
                      style={{ width: 200, height: 200, objectFit: 'contain', display: 'block' }} />
                  </div>
                ) : (
                  <div style={{ width: 200, height: 200, border: '2px dashed var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 16 }}>
                    QR not set.<br />Admin: go to Site Settings → Payment QR
                  </div>
                )}

                <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#16a34a', marginBottom: 20 }}>
                  ✅ After payment, upload the screenshot below to confirm your order
                </div>
              </div>

              {/* Upload screenshot */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  Upload Payment Screenshot *
                </label>
                <input type="file" accept="image/*" id="pay-screenshot" style={{ display: 'none' }} onChange={handleScreenshotUpload} />
                <label htmlFor="pay-screenshot" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '14px', border: `2px dashed ${screenshot ? 'var(--success)' : 'var(--border)'}`,
                  borderRadius: 10, cursor: 'pointer', fontSize: 14, color: screenshot ? 'var(--success)' : 'var(--text-muted)',
                  background: screenshot ? '#f0fdf4' : 'var(--bg-secondary)', transition: 'all 0.2s',
                }}>
                  {screenshot ? <CheckCircle size={18} /> : <Upload size={18} />}
                  {screenshot ? 'Screenshot uploaded ✓' : 'Click to upload screenshot'}
                </label>
                {screenshotPreview && (
                  <img src={screenshotPreview} alt="Preview"
                    style={{ width: '100%', maxHeight: 160, objectFit: 'contain', borderRadius: 8, marginTop: 10, border: '1px solid var(--border)' }} />
                )}
              </div>

              <button onClick={handleConfirmOrder}
                disabled={!screenshot}
                style={{
                  width: '100%', padding: '13px', border: 'none', borderRadius: 8,
                  fontSize: 15, fontWeight: 600, cursor: screenshot ? 'pointer' : 'not-allowed',
                  background: screenshot ? 'var(--primary)' : '#ccc', color: '#fff',
                }}>
                {screenshot ? '✓ Confirm Order' : 'Upload screenshot to confirm'}
              </button>
            </>
          )}

          {/* STEP 3: Done */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 12, animation: 'bounceIn 0.5s' }}>🎉</div>
              <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, color: 'var(--success)' }}>Order Placed Successfully!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                We will contact you on <strong>{form.phone}</strong> shortly.
              </p>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '14px 16px', textAlign: 'left', marginBottom: 20, fontSize: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Product</span>
                  <span style={{ fontWeight: 500 }}>{product.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Quantity</span>
                  <span style={{ fontWeight: 500 }}>{qty}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                  <span style={{ fontWeight: 700 }}>Total Paid</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{total}</span>
                </div>
              </div>
              {/* Track Order */}
              <a href="/orders"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--primary)', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none', marginBottom: 12 }}>
                <Package size={16} /> Track My Order
              </a>
              {siteConfig.whatsappNumber && (
                <a href={`https://wa.me/${siteConfig.whatsappNumber}`} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#25d366', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', marginBottom: 12 }}>
                  <MessageCircle size={16} /> Contact on WhatsApp
                </a>
              )}
              <button onClick={onClose}
                style={{ background: 'none', border: '1px solid var(--border)', padding: '8px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 14, width: '100%' }}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
