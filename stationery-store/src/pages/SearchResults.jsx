import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAdminStore } from '../store'
import ProductCard from '../components/ui/ProductCard'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const products = useAdminStore(state => state.products)
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [sort, setSort] = useState('newest')

  let results = products.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.category.toLowerCase().includes(q.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(q.toLowerCase())
  ).filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

  if (sort === 'price-asc') results.sort((a, b) => a.price - b.price)
  else if (sort === 'price-desc') results.sort((a, b) => b.price - a.price)

  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        <Link to="/">Home</Link> / Search results for "<strong>{q}</strong>"
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Results for "{q}"</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{results.length} products found</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13 }}>Price up to ₹{priceRange[1]}:</label>
          <input type="range" min={0} max={1000} step={10} value={priceRange[1]} onChange={e => setPriceRange([0, +e.target.value])} style={{ width: 100, accentColor: 'var(--primary)' }} />
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, background: '#fff' }}>
            <option value="newest">Newest</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
          </select>
        </div>
      </div>
      {results.length > 0
        ? <div className="grid-4">{results.map(p => <ProductCard key={p.id} product={p} />)}</div>
        : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 48 }}>🔍</p>
            <h3 style={{ marginTop: 12 }}>No products found for "{q}"</h3>
            <Link to="/categories" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Browse All Products</Link>
          </div>
        )
      }
    </div>
  )
}
