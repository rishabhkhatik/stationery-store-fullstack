import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { useAdminStore } from '../store'
import ProductCard from '../components/ui/ProductCard'

export default function Categories() {
  const { products, categories } = useAdminStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCat, setSelectedCat] = useState(searchParams.get('cat') || 'all')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [sort, setSort] = useState('newest')
  const [filterOpen, setFilterOpen] = useState(false)
  const filter = searchParams.get('filter')

  useEffect(() => {
    const cat = searchParams.get('cat')
    if (cat) setSelectedCat(cat)
  }, [searchParams])

  let filtered = [...products]

  if (filter === 'trending') filtered = filtered.filter(p => p.trending)
  else if (filter === 'topSelling') filtered = filtered.filter(p => p.topSelling)
  else if (selectedCat !== 'all') filtered = filtered.filter(p => p.category === selectedCat || p.category.includes(selectedCat))

  filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price)
  else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price)
  else if (sort === 'discount') filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0))
  else if (sort === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))

  const maxPrice = Math.max(...products.map(p => p.price), 1000)

  return (
    <div className="container" style={{ padding: '24px 16px' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        <Link to="/">Home</Link> / <span>Categories</span>
        {selectedCat !== 'all' && <> / <span style={{ color: 'var(--text)', fontWeight: 500, textTransform: 'capitalize' }}>{selectedCat.replace(/-/g, ' ')}</span></>}
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Sidebar - desktop */}
        <aside style={{ width: 240, flexShrink: 0, display: 'none' }} className="desktop-sidebar">
          <FilterPanel categories={categories} selectedCat={selectedCat} setSelectedCat={setSelectedCat}
            priceRange={priceRange} setPriceRange={setPriceRange} maxPrice={maxPrice} />
        </aside>

        {/* Main */}
        <div style={{ flex: 1 }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700 }}>
                {filter === 'trending' ? '🔥 Trending Products' : filter === 'topSelling' ? '⭐ Top Selling' : selectedCat === 'all' ? 'All Products' : selectedCat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} products found</p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={() => setFilterOpen(true)} className="btn btn-outline" style={{ padding: '8px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <SlidersHorizontal size={14} /> Filters
              </button>
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer' }}>
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Highest Discount</option>
                <option value="rating">Best Rated</option>
              </select>
            </div>
          </div>

          {/* Active filters */}
          {(selectedCat !== 'all' || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {selectedCat !== 'all' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '4px 10px', borderRadius: 20, fontSize: 12 }}>
                  {selectedCat.replace(/-/g, ' ')}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedCat('all')} />
                </span>
              )}
              {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '4px 10px', borderRadius: 20, fontSize: 12 }}>
                  ₹{priceRange[0]}–₹{priceRange[1]}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setPriceRange([0, maxPrice])} />
                </span>
              )}
              <button onClick={() => { setSelectedCat('all'); setPriceRange([0, maxPrice]) }} style={{ fontSize: 12, color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Clear All</button>
            </div>
          )}

          {/* Product grid */}
          {filtered.length > 0 ? (
            <div className="grid-4">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h3 style={{ marginBottom: 8 }}>No products found</h3>
              <p>Try adjusting your filters</p>
              <button onClick={() => { setSelectedCat('all'); setPriceRange([0, maxPrice]) }} className="btn btn-primary" style={{ marginTop: 16 }}>Reset Filters</button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setFilterOpen(false)} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 300, background: '#fff', overflowY: 'auto', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700 }}>Filters</h3>
              <button onClick={() => setFilterOpen(false)}><X size={20} /></button>
            </div>
            <FilterPanel categories={categories} selectedCat={selectedCat} setSelectedCat={(c) => { setSelectedCat(c); setFilterOpen(false) }}
              priceRange={priceRange} setPriceRange={setPriceRange} maxPrice={maxPrice} />
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) { .desktop-sidebar { display: block !important; } }
      `}</style>
    </div>
  )
}

function FilterPanel({ categories, selectedCat, setSelectedCat, priceRange, setPriceRange, maxPrice }) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Price Range</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
          <span>₹{priceRange[0]}</span><span>₹{priceRange[1]}</span>
        </div>
        <input type="range" min={0} max={maxPrice} step={10} value={priceRange[1]}
          onChange={e => setPriceRange([priceRange[0], +e.target.value])}
          style={{ width: '100%', accentColor: 'var(--primary)' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {[[0, 50], [50, 150], [150, 300], [300, 1000]].map(([min, max]) => (
            <button key={min} onClick={() => setPriceRange([min, max])}
              style={{ fontSize: 11, padding: '4px 8px', borderRadius: 20, border: '1px solid var(--border)', background: priceRange[0] === min && priceRange[1] === max ? 'var(--primary)' : '#fff', color: priceRange[0] === min && priceRange[1] === max ? '#fff' : 'var(--text)', cursor: 'pointer' }}>
              ₹{min}–{max === 1000 ? '1000+' : max}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Categories</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button onClick={() => setSelectedCat('all')}
            style={{ textAlign: 'left', padding: '8px 10px', borderRadius: 8, fontSize: 13, background: selectedCat === 'all' ? 'var(--primary-light)' : 'transparent', color: selectedCat === 'all' ? 'var(--primary-dark)' : 'var(--text)', fontWeight: selectedCat === 'all' ? 600 : 400, border: 'none', cursor: 'pointer' }}>
            All Categories
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCat(cat.slug)}
              style={{ textAlign: 'left', padding: '8px 10px', borderRadius: 8, fontSize: 13, background: selectedCat === cat.slug ? 'var(--primary-light)' : 'transparent', color: selectedCat === cat.slug ? 'var(--primary-dark)' : 'var(--text)', fontWeight: selectedCat === cat.slug ? 600 : 400, border: 'none', cursor: 'pointer' }}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
