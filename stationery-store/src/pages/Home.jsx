import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import Slider from 'react-slick'
import { ChevronLeft, ChevronRight, Star, TrendingUp, Award } from 'lucide-react'
import { useAdminStore } from '../store'
import ProductCard from '../components/ui/ProductCard'
import { REVIEWS } from '../data/products'

export default function Home() {
  // Selectors prevent Home from re-rendering on admin-only state changes (orders, carts)
  const products = useAdminStore(state => state.products)
  const categories = useAdminStore(state => state.categories)
  const banners = useAdminStore(state => state.banners)
  const siteConfig = useAdminStore(state => state.siteConfig)
  const [priceRange, setPriceRange] = useState([0, 1000])
  const bannerRef = useRef()

  const trending = products.filter(p => p.trending)
  const topSelling = products.filter(p => p.topSelling)
  const filteredByPrice = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
  const showHero = siteConfig.showHeroBanner !== false
  const showAdminLogin = siteConfig.showAdminSection !== false

  const catSettings = {
    dots: false, infinite: false, speed: 400, slidesToShow: 8, slidesToScroll: 3,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 6 } },
      { breakpoint: 900, settings: { slidesToShow: 4 } },
      { breakpoint: 600, settings: { slidesToShow: 3 } },
    ]
  }
  const productSettings = {
    dots: false, infinite: false, speed: 400, slidesToShow: 5, slidesToScroll: 2,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 4 } },
      { breakpoint: 900, settings: { slidesToShow: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 2 } },
    ]
  }

  return (
    <div>
      {/* Hero Banner */}
      {showHero && banners.length > 0 && (
        <section style={{ position: 'relative' }}>
          <Slider ref={bannerRef} dots infinite speed={600} slidesToShow={1} slidesToScroll={1} autoplay autoplaySpeed={4500}>
            {banners.map(banner => (
              <div key={banner.id}>
                <Link to={banner.link || '/categories'} style={{ display: 'block' }}>
                  <div style={{ position: 'relative', overflow: 'hidden', background: '#f9e0ef' }} className="hero-banner-slide">
                    <img src={banner.image} alt={banner.title || 'Banner'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.style.display = 'none' }} />
                    {(banner.title || banner.subtitle) && (
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,rgba(0,0,0,.5) 0%,transparent 65%)', display: 'flex', alignItems: 'center', padding: '0 5%' }}>
                        <div style={{ maxWidth: '55%' }}>
                          {banner.title && <h1 style={{ color: '#fff', fontSize: 'clamp(18px, 4vw, 36px)', fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>{banner.title}</h1>}
                          {banner.subtitle && <p style={{ color: '#eee', fontSize: 'clamp(12px, 2vw, 16px)', marginBottom: 16 }}>{banner.subtitle}</p>}
                          <span className="btn btn-primary" style={{ fontSize: 'clamp(12px, 2vw, 14px)' }}>{siteConfig.bannerButtonText || 'Shop Now'} →</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </Slider>
          {banners.length > 1 && <>
            <button onClick={() => bannerRef.current?.slickPrev()} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.9)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}><ChevronLeft size={20} /></button>
            <button onClick={() => bannerRef.current?.slickNext()} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.9)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}><ChevronRight size={20} /></button>
          </>}
        </section>
      )}

      {/* Trust bar */}
      <div style={{ background: 'var(--primary)', color: '#fff' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: 40, padding: '12px 16px', flexWrap: 'wrap' }}>
          {['🚚 Fast Delivery', '✅ Quality Products', '💰 Best Prices', '🎁 Return Gift Specialists'].map(t => (
            <span key={t} style={{ fontSize: 13, fontWeight: 500 }}>{t}</span>
          ))}
        </div>
      </div>

      <div className="container" style={{ padding: '0 16px' }}>
        {/* Categories Slider */}
        <section style={{ marginTop: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>Browse our wide range of stationery and gift items</p>
            </div>
            <Link to="/categories" className="btn btn-outline">View All</Link>
          </div>
          <Slider {...catSettings}>
            {categories.map(cat => (
              <div key={cat.id} style={{ padding: '0 6px' }}>
                <Link to={`/category/${cat.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 8px', border: '2px solid var(--border)', background: '#f5f5f5', transition: 'border-color .2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                      <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.src = `https://placehold.co/80x80/fce4f0/e84393?text=${encodeURIComponent(cat.name[0])}` }} />
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)', lineHeight: 1.3, padding: '0 4px' }}>{cat.name}</p>
                  </div>
                </Link>
              </div>
            ))}
          </Slider>
        </section>

        {/* Trending */}
        {trending.length > 0 && (
          <section style={{ marginTop: 52 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
              <div>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={22} color="var(--primary)" /> Latest Trending</h2>
                <p className="section-subtitle" style={{ marginBottom: 0 }}>Hot picks flying off our shelves</p>
              </div>
              <Link to="/categories?filter=trending" className="btn btn-outline">View All</Link>
            </div>
            <Slider {...productSettings}>
              {trending.map(p => <div key={p.id} style={{ padding: '0 8px' }}><ProductCard product={p} /></div>)}
            </Slider>
          </section>
        )}

        {/* Top Selling */}
        {topSelling.length > 0 && (
          <section style={{ marginTop: 52 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
              <div>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Award size={22} color="var(--accent)" /> Top Selling</h2>
                <p className="section-subtitle" style={{ marginBottom: 0 }}>Bestsellers loved by our customers</p>
              </div>
              <Link to="/categories?filter=topSelling" className="btn btn-outline">View All</Link>
            </div>
            <Slider {...productSettings}>
              {topSelling.map(p => <div key={p.id} style={{ padding: '0 8px' }}><ProductCard product={p} /></div>)}
            </Slider>
          </section>
        )}

        {/* Global Price Filter */}
        <section style={{ marginTop: 52 }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary-light), #fff)', borderRadius: 16, padding: 32, border: '1px solid #f0d0e8' }}>
            <h2 className="section-title" style={{ marginBottom: 6 }}>🔍 Filter Products by Price</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Find products that fit your budget</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>₹{priceRange[0]}</span>
                <input type="range" min={0} max={1000} step={10} value={priceRange[0]}
                  onChange={e => { if (+e.target.value < priceRange[1]) setPriceRange([+e.target.value, priceRange[1]]) }}
                  style={{ width: 100, accentColor: 'var(--primary)' }} />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>to</span>
                <input type="range" min={0} max={1000} step={10} value={priceRange[1]}
                  onChange={e => { if (+e.target.value > priceRange[0]) setPriceRange([priceRange[0], +e.target.value]) }}
                  style={{ width: 100, accentColor: 'var(--primary)' }} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>₹{priceRange[1]}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[[0, 50, 'Under ₹50'], [50, 150, '₹50–150'], [150, 300, '₹150–300'], [300, 1000, '₹300+']].map(([min, max, label]) => (
                  <button key={label} onClick={() => setPriceRange([min, max])} className="btn btn-outline"
                    style={{ padding: '5px 10px', fontSize: 12, background: priceRange[0] === min && priceRange[1] === max ? 'var(--primary)' : 'transparent', color: priceRange[0] === min && priceRange[1] === max ? '#fff' : 'var(--primary)', borderColor: 'var(--primary)' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Showing <strong>{filteredByPrice.length}</strong> products in ₹{priceRange[0]}–₹{priceRange[1]} range</p>
            {filteredByPrice.length > 0 ? (
              <div className="grid-5">{filteredByPrice.slice(0, 10).map(p => <ProductCard key={p.id} product={p} />)}</div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                <p style={{ fontSize: 36, marginBottom: 12 }}>💸</p>
                <p style={{ marginBottom: 16 }}>No products in this price range.</p>
                <button onClick={() => setPriceRange([0, 1000])} className="btn btn-primary">Reset Filter</button>
              </div>
            )}
          </div>
        </section>

        {/* Reviews */}
        <section style={{ marginTop: 52 }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 6 }}>⭐ What Our Customers Say</h2>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Real reviews from verified buyers</p>
          <div className="grid-4">
            {REVIEWS.map((r, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={14} fill={j < r.rating ? '#f59e0b' : 'transparent'} color={j < r.rating ? '#f59e0b' : '#ddd'} />)}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>"{r.text}"</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', background: '#f5f5f5', padding: '2px 8px', borderRadius: 20 }}>{r.type}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div style={{ height: 60 }} />
    </div>
  )
}
