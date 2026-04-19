import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { useAdminStore } from '../store'
import ProductCard from '../components/ui/ProductCard'

export default function CategoryPage() {
  const { slug } = useParams()
  const { products, categories } = useAdminStore()
  const category = categories.find(c => c.slug === slug)
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [sort, setSort] = useState('newest')

  let filtered = products.filter(p => p.category === slug || p.category.replace(/\s+/g, '-').toLowerCase() === slug)
  filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price)
  else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price)
  else if (sort === 'discount') filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0))
  else if (sort === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))

  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        <Link to="/">Home</Link> / <Link to="/categories">Categories</Link> / <span style={{ color: 'var(--text)', fontWeight: 500 }}>{category?.name || slug}</span>
      </div>

      {category?.image && (
        <div style={{ height: 180, borderRadius: 16, overflow: 'hidden', marginBottom: 24, background: '#f5f5f5', position: 'relative' }}>
          <img src={category.image} alt={category.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', paddingLeft: 'clamp(16px, 5%, 40px)' }}>
            <div>
              <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 700 }}>{category.name}</h1>
              <p style={{ color: '#eee', fontSize: 14 }}>{filtered.length} products</p>
            </div>
          </div>
        </div>
      )}

      {!category?.image && <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>{category?.name || slug}</h1>}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <SlidersHorizontal size={14} />
          <span style={{ fontWeight: 500 }}>Price:</span>
          <span style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '3px 10px', borderRadius: 20 }}>₹{priceRange[0]} – ₹{priceRange[1]}</span>
          <input type="range" min={0} max={1000} step={10} value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value])} style={{ width: 100, accentColor: 'var(--primary)' }} />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{ marginLeft: 'auto', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, background: '#fff' }}>
          <option value="newest">Newest</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="discount">Discount</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {filtered.length > 0
        ? <div className="grid-4">{filtered.map(p => <ProductCard key={p.id} product={p} />)}</div>
        : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 48 }}>📦</p>
            <h3 style={{ marginTop: 12 }}>No products found in this price range</h3>
            <button onClick={() => setPriceRange([0, 1000])} className="btn btn-primary" style={{ marginTop: 16 }}>Reset Filter</button>
          </div>
        )
      }
    </div>
  )
}
