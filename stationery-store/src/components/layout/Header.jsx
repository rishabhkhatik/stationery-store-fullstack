import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, User, Menu, X, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useCartStore, useAuthStore, useAdminStore } from '../../store'
import toast from 'react-hot-toast'

export default function Header() {
  const navigate = useNavigate()
  const { items } = useCartStore()
  const { user, isLoggedIn, logout } = useAuthStore()
  const { products, siteConfig } = useAdminStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)
  const searchRef = useRef(null)
  const itemCount = items.reduce((s, i) => s + i.qty, 0)

  useEffect(() => {
    const handler = (e) => { if (!searchRef.current?.contains(e.target)) setShowSearch(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (q) => {
    setSearchQuery(q)
    if (q.length < 2) { setSearchResults([]); return }
    const results = products.filter(p =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.category.toLowerCase().includes(q.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(q.toLowerCase())
    ).slice(0, 8)
    setSearchResults(results)
    setShowSearch(true)
  }

  const handleCartClick = () => {
    if (!isLoggedIn) {
      toast.error('Please login to view your cart')
      navigate('/login?redirect=/cart')
      return
    }
    navigate('/cart')
  }

  const handleLogout = () => {
    logout()
    setUserDropdown(false)
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <>
      {siteConfig.announcement && (
        <div style={{ background: 'var(--primary)', color: '#fff', textAlign: 'center', padding: '8px', fontSize: '13px', fontWeight: 500 }}>
          {siteConfig.announcement}
        </div>
      )}
      <header style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        {/* Top row: logo + right actions (+ hamburger on mobile) */}
        <div className="container header-top-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}>
          {/* Logo */}
          <Link to="/" style={{ flexShrink: 0 }}>
            {siteConfig.logo ? (
              <img src={siteConfig.logo} alt={siteConfig.storeName} style={{ height: 44, objectFit: 'contain' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)', lineHeight: 1.1 }}>{siteConfig.storeName}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{siteConfig.tagline}</span>
              </div>
            )}
          </Link>

          {/* Search bar — hidden on mobile, shown on tablet+ */}
          <div ref={searchRef} className="header-search-desktop" style={{ flex: 1, position: 'relative', maxWidth: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: 30, padding: '8px 16px', gap: 8 }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setShowSearch(true)}
                placeholder="Search products, categories..."
                style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: 14, minWidth: 0 }}
                onKeyDown={e => { if (e.key === 'Enter' && searchQuery) { navigate(`/search?q=${searchQuery}`); setShowSearch(false) }}}
              />
              {searchQuery && <X size={14} style={{ cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }} onClick={() => { setSearchQuery(''); setSearchResults([]) }} />}
            </div>
            {showSearch && searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: '#fff', boxShadow: 'var(--shadow-lg)', borderRadius: 12, overflow: 'hidden', zIndex: 200 }}>
                {searchResults.map(p => (
                  <Link key={p.id} to={`/product/${p.slug}`} onClick={() => { setShowSearch(false); setSearchQuery('') }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid #f0f0f0', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                    <img src={p.image} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>₹{p.price} {p.discount > 0 && <span style={{ color: 'var(--success)' }}>{p.discount}% off</span>}</div>
                    </div>
                  </Link>
                ))}
                <div style={{ padding: '8px 16px', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
                  <button onClick={() => { navigate(`/search?q=${searchQuery}`); setShowSearch(false) }}
                    style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
                    See all results for "{searchQuery}"
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 'auto' }}>
            {/* User */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => isLoggedIn ? setUserDropdown(!userDropdown) : navigate('/login')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 30, background: '#f5f5f5', fontSize: 13, fontWeight: 500 }}>
                <User size={16} />
                <span className="hide-mobile">{isLoggedIn ? user?.name?.split(' ')[0] : 'Login'}</span>
                {isLoggedIn && <ChevronDown size={12} className="hide-mobile" />}
              </button>
              {userDropdown && isLoggedIn && (
                <div style={{ position: 'absolute', top: '110%', right: 0, background: '#fff', boxShadow: 'var(--shadow-lg)', borderRadius: 12, padding: 8, minWidth: 180, zIndex: 200 }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.email}</div>
                  </div>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setUserDropdown(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', fontSize: 14, color: 'var(--primary)', borderRadius: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <Settings size={14} /> Admin Panel
                    </Link>
                  )}
                  <Link to="/orders" onClick={() => setUserDropdown(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', fontSize: 14, borderRadius: 8 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    My Orders
                  </Link>
                  <button onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', fontSize: 14, color: 'var(--error)', borderRadius: 8, width: '100%', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>

            {/* Cart */}
            <button onClick={handleCartClick}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 30, background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 500 }}>
              <ShoppingCart size={16} />
              <span className="hide-mobile">Cart</span>
              {itemCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--accent)', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                  {itemCount}
                </span>
              )}
            </button>

            {/* Hamburger — mobile only */}
            <button onClick={() => setMobileMenu(true)} className="hamburger-btn"
              style={{ display: 'none', alignItems: 'center', justifyContent: 'center', padding: 8, background: '#f5f5f5', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
              <Menu size={22} color="var(--text)" />
            </button>
          </div>
        </div>

        {/* Mobile search bar — full width, shown only on mobile */}
        <div className="header-search-mobile" style={{ padding: '0 12px 10px' }}>
          <div ref={searchRef} style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: 30, padding: '8px 16px', gap: 8 }}>
              <Search size={15} color="var(--text-muted)" />
              <input
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setShowSearch(true)}
                placeholder="Search products..."
                style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: 14, minWidth: 0 }}
                onKeyDown={e => { if (e.key === 'Enter' && searchQuery) { navigate(`/search?q=${searchQuery}`); setShowSearch(false) }}}
              />
              {searchQuery && <X size={14} style={{ cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }} onClick={() => { setSearchQuery(''); setSearchResults([]) }} />}
            </div>
            {showSearch && searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: '#fff', boxShadow: 'var(--shadow-lg)', borderRadius: 12, overflow: 'hidden', zIndex: 200 }}>
                {searchResults.map(p => (
                  <Link key={p.id} to={`/product/${p.slug}`} onClick={() => { setShowSearch(false); setSearchQuery('') }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid #f0f0f0' }}>
                    <img src={p.image} alt={p.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>₹{p.price}</div>
                    </div>
                  </Link>
                ))}
                <div style={{ padding: '8px 16px', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
                  <button onClick={() => { navigate(`/search?q=${searchQuery}`); setShowSearch(false) }}
                    style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
                    See all results →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category nav bar */}
        <div style={{ borderTop: '1px solid var(--border)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          <div style={{ display: 'flex', gap: 0, padding: '0 16px', whiteSpace: 'nowrap' }}>
            {['Pencil', 'Notebook', 'Stapler', 'Lunch Box', 'Sippers & Bottles', 'Multipurpose Containers', 'Giftset', 'Slime', 'Toys'].map(cat => (
              <Link key={cat} to={`/categories?cat=${cat.toLowerCase().replace(/\s+/g, '-').replace('&', '')}`}
                style={{ display: 'inline-block', padding: '9px 12px', fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', transition: 'color 0.2s', borderBottom: '2px solid transparent', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { e.target.style.color = 'var(--primary)'; e.target.style.borderBottomColor = 'var(--primary)' }}
                onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.borderBottomColor = 'transparent' }}>
                {cat}
              </Link>
            ))}
            <Link to="/categories"
              style={{ display: 'inline-block', padding: '9px 12px', fontSize: 12, fontWeight: 600, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
              All →
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileMenu && (
        <div onClick={() => setMobileMenu(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }} />
      )}

      {/* Mobile sidebar drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 280,
        background: '#fff', zIndex: 999, overflowY: 'auto',
        transform: mobileMenu ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s ease',
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Sidebar header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>{siteConfig.storeName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{siteConfig.tagline}</div>
          </div>
          <button onClick={() => setMobileMenu(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={22} color="var(--text-muted)" />
          </button>
        </div>

        {/* User info */}
        {isLoggedIn ? (
          <div style={{ padding: '14px 16px', background: 'var(--primary-light)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.email}</div>
          </div>
        ) : (
          <Link to="/login" onClick={() => setMobileMenu(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'var(--primary-light)', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--primary)', fontSize: 14 }}>
            <User size={16} /> Login / Sign In
          </Link>
        )}

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {[
            { label: '🏠 Home', to: '/' },
            { label: '🏷️ Categories', to: '/categories' },
            { label: '🛒 Cart', to: '/cart' },
            { label: '📦 My Orders', to: '/orders' },
            { label: 'ℹ️ About Us', to: '/about' },
            { label: '📞 Contact', to: '/contact' },
            { label: '🚚 Shipping Policy', to: '/shipping' },
            { label: '↩️ Return & Refund', to: '/refund' },
            { label: '📜 Terms & Conditions', to: '/terms' },
            { label: '🔒 Privacy Policy', to: '/privacy' },
          ].map(item => (
            <Link key={item.to} to={item.to} onClick={() => setMobileMenu(false)}
              style={{ display: 'block', padding: '13px 20px', fontSize: 14, fontWeight: 500, color: 'var(--text)', borderBottom: '1px solid #f5f5f5', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {item.label}
            </Link>
          ))}

          {/* Categories quick links */}
          <div style={{ padding: '10px 20px 4px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 8 }}>
            Shop by Category
          </div>
          {['Pencil', 'Notebook', 'Stapler', 'Lunch Box', 'Sippers & Bottles', 'Giftset', 'Slime', 'Toys'].map(cat => (
            <Link key={cat} to={`/category/${cat.toLowerCase().replace(/\s+/g, '-').replace(/&\s*/g, '')}`}
              onClick={() => setMobileMenu(false)}
              style={{ display: 'block', padding: '10px 20px 10px 28px', fontSize: 13, color: 'var(--text-muted)', borderBottom: '1px solid #f5f5f5', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              {cat}
            </Link>
          ))}

          {/* Admin panel link */}
          {isLoggedIn && user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setMobileMenu(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 20px', fontSize: 14, fontWeight: 600, color: 'var(--primary)', borderTop: '1px solid var(--border)', marginTop: 8 }}>
              <Settings size={15} /> Admin Panel
            </Link>
          )}
        </nav>

        {/* Logout */}
        {isLoggedIn && (
          <button onClick={() => { handleLogout(); setMobileMenu(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', fontSize: 14, fontWeight: 500, color: 'var(--error)', borderTop: '1px solid var(--border)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
            <LogOut size={16} /> Logout
          </button>
        )}
      </div>

      <style>{`
        /* Desktop: show desktop search, hide mobile search */
        .header-search-desktop { display: flex; }
        .header-search-mobile { display: none; }
        .hamburger-btn { display: none !important; }

        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .header-search-desktop { display: none !important; }
          .header-search-mobile { display: block !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}
