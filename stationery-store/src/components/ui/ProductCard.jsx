import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Heart, Zap, Plus, Minus } from 'lucide-react'
import { useCartStore, useAuthStore } from '../../store'
import OrderPopup from './OrderPopup'
import SignupPopup from './SignupPopup'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addItem, items, updateQty, removeItem } = useCartStore()
  const { isLoggedIn } = useAuthStore()
  const [wishlist, setWishlist] = useState(false)
  const [showOrderPopup, setShowOrderPopup] = useState(false)
  const [showSignup, setShowSignup] = useState(false)

  const cartItem = items.find(i => i.id === product.id)

  const handleAddToCart = (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!isLoggedIn) {
      setShowSignup(true)
      return
    }
    addItem(product)
    toast.success(`${product.name} added to cart!`)
  }

  const handleSignupSuccess = () => {
    setShowSignup(false)
    addItem(product)
    toast.success(`${product.name} added to cart!`)
  }

  const handleOrderNow = (e) => {
    e.preventDefault(); e.stopPropagation()
    setShowOrderPopup(true)
  }

  return (
    <>
      <Link to={`/product/${product.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <div style={{
          background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)',
          transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>

          {/* Image */}
          <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: '#f9f9f9' }}>
            <img src={product.image} alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x300?text=No+Image' }} />

            {product.discount > 0 && (
              <span style={{ position: 'absolute', top: 8, left: 8, background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
                {product.discount}% OFF
              </span>
            )}
            {product.trending && (
              <span style={{ position: 'absolute', top: 8, right: 36, background: '#f59e0b', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
                TRENDING
              </span>
            )}
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWishlist(!wishlist) }}
              style={{ position: 'absolute', top: 8, right: 8, background: wishlist ? '#fee2e2' : '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Heart size={14} fill={wishlist ? '#ef4444' : 'none'} color={wishlist ? '#ef4444' : '#999'} />
            </button>
          </div>

          {/* Info */}
          <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {product.name}
            </div>

            {product.rating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={11} fill="#f59e0b" color="#f59e0b" />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{product.rating} ({product.reviews})</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>₹{product.price}</span>
              {product.originalPrice && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{product.originalPrice}</span>
              )}
            </div>

            {/* Cart button (or Qty selector if already in cart) + Order Now */}
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              {cartItem ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', border: '1.5px solid var(--primary)', borderRadius: 8, overflow: 'hidden', height: 30 }}
                  onClick={e => { e.preventDefault(); e.stopPropagation() }}>
                  <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); cartItem.qty <= 1 ? removeItem(product.id) : updateQty(product.id, cartItem.qty - 1) }}
                    style={{ flex: 1, height: '100%', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Minus size={11} />
                  </button>
                  <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{cartItem.qty}</span>
                  <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); updateQty(product.id, cartItem.qty + 1) }}
                    style={{ flex: 1, height: '100%', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={11} />
                  </button>
                </div>
              ) : (
                <button onClick={handleAddToCart}
                  style={{ flex: 1, padding: '7px 8px', background: 'var(--primary)', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, border: 'none', cursor: 'pointer' }}>
                  <ShoppingCart size={12} />
                  Cart
                </button>
              )}
              <button onClick={handleOrderNow}
                style={{ flex: 1, padding: '7px 8px', background: '#fff7ed', color: '#ea580c', border: '1.5px solid #fed7aa', borderRadius: 8, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer' }}>
                <Zap size={12} />
                Order
              </button>
            </div>
          </div>
        </div>
      </Link>

      {showOrderPopup && (
        <OrderPopup product={product} onClose={() => setShowOrderPopup(false)} />
      )}
      {showSignup && (
        <SignupPopup onClose={() => setShowSignup(false)} onSuccess={handleSignupSuccess} />
      )}
    </>
  )
}
