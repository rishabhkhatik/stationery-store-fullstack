import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Star, ChevronLeft, ChevronRight, Share2, Heart } from 'lucide-react'
import { useAdminStore, useCartStore, useAuthStore } from '../store'
import ProductCard from '../components/ui/ProductCard'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { slug } = useParams()
  const { products } = useAdminStore()
  const { addItem } = useCartStore()
  const { isLoggedIn } = useAuthStore()
  const navigate = useNavigate()
  const product = products.find(p => p.slug === slug)
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [wishlist, setWishlist] = useState(false)

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h2>Product not found</h2>
      <Link to="/categories" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Browse Products</Link>
    </div>
  )

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 5)
  const images = product.images?.length ? product.images : [product.image]

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      toast.error('Please login to add to cart')
      navigate('/login?redirect=/product/' + slug)
      return
    }
    addItem(product, qty)
    toast.success(`${product.name} added to cart!`)
  }

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      toast.error('Please login to continue')
      navigate('/login?redirect=/product/' + slug)
      return
    }
    addItem(product, qty)
    navigate('/cart')
  }

  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        <Link to="/">Home</Link> / <Link to="/categories">Categories</Link> / <Link to={`/category/${product.category}`}>{product.category.replace(/-/g, ' ')}</Link> / <span style={{ color: 'var(--text)' }}>{product.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
        {/* Images */}
        <div>
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#f9f9f9', aspectRatio: '1', marginBottom: 12 }}>
            <img src={images[activeImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={e => { e.target.src = 'https://via.placeholder.com/500' }} />
            {images.length > 1 && (
              <>
                <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                  style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setActiveImg(i => (i + 1) % images.length)}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => setActiveImg(i)}
                  style={{ width: 70, height: 70, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${activeImg === i ? 'var(--primary)' : 'var(--border)'}` }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {product.trending && <span className="badge badge-primary">Trending</span>}
            {product.topSelling && <span className="badge badge-green">Top Selling</span>}
            {product.discount > 0 && <span className="badge badge-red">{product.discount}% OFF</span>}
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3, marginBottom: 12 }}>{product.name}</h1>

          {product.rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 3 }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= Math.round(product.rating) ? '#f59e0b' : 'transparent'} color="#f59e0b" />)}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{product.rating}</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>({product.reviews} reviews)</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)' }}>₹{product.price}</span>
            {product.originalPrice && (
              <>
                <span style={{ fontSize: 18, color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{product.originalPrice}</span>
                <span style={{ fontSize: 16, color: 'var(--success)', fontWeight: 600 }}>You save ₹{product.originalPrice - product.price}</span>
              </>
            )}
          </div>

          {product.variant && (
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Variant: </span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{product.variant}</span>
            </div>
          )}

          {product.description && (
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24 }}>{product.description}</p>
          )}

          {/* Qty */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Quantity:</span>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', border: 'none', fontSize: 18, cursor: 'pointer' }}>−</button>
              <span style={{ width: 40, textAlign: 'center', fontSize: 14, fontWeight: 600 }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)}
                style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', border: 'none', fontSize: 18, cursor: 'pointer' }}>+</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <button onClick={handleAddToCart} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
              <ShoppingCart size={16} /> Add to Cart
            </button>
            <button onClick={handleBuyNow} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
              Buy Now
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setWishlist(!wishlist)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: wishlist ? '#ef4444' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Heart size={14} fill={wishlist ? '#ef4444' : 'none'} /> Wishlist
            </button>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section style={{ marginTop: 52 }}>
          <h2 className="section-title">Related Products</h2>
          <div className="grid-5" style={{ marginTop: 20 }}>
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 768px) {
          .container > div:first-of-type + div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
