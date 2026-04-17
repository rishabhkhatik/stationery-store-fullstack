import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Star, Heart, Zap } from 'lucide-react'
import { useCartStore, useAuthStore } from '../../store'
import OrderPopup from './OrderPopup'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addItem } = useCartStore()
  const { isLoggedIn } = useAuthStore()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [wishlist, setWishlist] = useState(false)
  const [showOrderPopup, setShowOrderPopup] = useState(false)

  const handleAddToCart = (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!isLoggedIn) {
      toast.error('Please login to add items to cart')
      navigate('/login?redirect=' + window.location.pathname)
      return
    }
    setAdding(true)
    addItem(product)
    toast.success(`${product.name} added to cart!`)
    setTimeout(() => setAdding(false), 600)
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
              onError={e => { e.target.src = 'https://via.placeholder.com/300x300?text=Product' }} />

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

            {/* Two buttons: Add to Cart + Order Now */}
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <button onClick={handleAddToCart}
                style={{ flex: 1, padding: '7px 8px', background: adding ? 'var(--success)' : 'var(--primary)', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'background 0.2s', border: 'none', cursor: 'pointer' }}>
                <ShoppingCart size={12} />
                {adding ? 'Added!' : 'Cart'}
              </button>
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
    </>
  )
}
