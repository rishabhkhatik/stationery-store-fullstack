import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tag, Image, ShoppingBag, Users, Settings,
  Plus, Trash2, Edit3, Save, X, Eye, EyeOff, Upload, LogOut, Menu,
  TrendingUp, Award, Download, Check, AlertCircle, Lock, QrCode
} from 'lucide-react'
import { useAdminStore, useAuthStore } from '../store'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products',  label: 'Products',  icon: Package },
  { id: 'categories',label: 'Categories',icon: Tag },
  { id: 'banners',   label: 'Banners',   icon: Image },
  { id: 'orders',    label: 'Orders',    icon: ShoppingBag },
  { id: 'users',     label: 'Users',     icon: Users },
  { id: 'team',      label: 'Team Members', icon: Users },
  { id: 'cms',       label: 'Content / CMS', icon: Settings },
  { id: 'settings',  label: 'Site Settings', icon: Settings },
]

export default function AdminPanel() {
  const { user, isLoggedIn, logout } = useAuthStore()
  const { syncFromBackend } = useAdminStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState('dashboard')
  // Bug #4: Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Real-time sync: fetch fresh data from backend on mount and every 15s
  useEffect(() => {
    syncFromBackend()
    const interval = setInterval(syncFromBackend, 15000)
    return () => clearInterval(interval)
  }, [])

  if (!isLoggedIn || user?.role !== 'admin') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <AlertCircle size={48} color="var(--error)" />
        <h2>Admin Access Only</h2>
        <p style={{ color: 'var(--text-muted)' }}>You must be logged in as admin to view this page.</p>
        <Link to="/login?redirect=/admin" className="btn btn-primary">Login as Admin</Link>
      </div>
    )
  }

  const handleLogout = () => { logout(); navigate('/') }

  const handleNav = (id) => {
    setTab(id)
    setSidebarOpen(false) // close on mobile after tap
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f8', position: 'relative' }}>

      {/* Bug #4: Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'none' }}
          className="admin-overlay" />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}
        style={{ width: 240, background: '#1e1e2d', color: '#c9c9d3', flexShrink: 0, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', zIndex: 1000 }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>🛍️ Admin Panel</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{user?.email}</div>
          </div>
          {/* Close button for mobile */}
          <button onClick={() => setSidebarOpen(false)} className="sidebar-close"
            style={{ display: 'none', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => handleNav(item.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: tab === item.id ? 600 : 400, background: tab === item.id ? 'rgba(232,67,147,0.2)' : 'transparent', color: tab === item.id ? '#e84393' : '#c9c9d3', border: 'none', cursor: 'pointer', marginBottom: 2, transition: 'all 0.15s', textAlign: 'left' }}>
              <item.icon size={16} /> {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, fontSize: 14, color: '#ff6b6b', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main" style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        {/* Bug #4: Mobile header with hamburger */}
        <div className="admin-header"
          style={{ display: 'none', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#1e1e2d', position: 'sticky', top: 0, zIndex: 100 }}>
          <button onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}>
            <Menu size={22} />
          </button>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
            {NAV_ITEMS.find(n => n.id === tab)?.label || 'Admin'}
          </span>
        </div>

        <div style={{ padding: '28px' }} className="admin-content">
          {tab === 'dashboard'  && <Dashboard />}
          {tab === 'products'   && <ProductManager />}
          {tab === 'categories' && <CategoryManager />}
          {tab === 'banners'    && <BannerManager />}
          {tab === 'orders'     && <OrderManager />}
          {tab === 'users'      && <UserManager />}
          {tab === 'team'       && <TeamManager />}
          {tab === 'cms'        && <CMSManager />}
          {tab === 'settings'   && <SiteSettings />}
        </div>
      </main>

      {/* Bug #4: Admin responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed !important;
            left: -260px !important;
            top: 0; bottom: 0;
            transition: left 0.28s ease !important;
            box-shadow: 4px 0 24px rgba(0,0,0,0.3);
          }
          .admin-sidebar.open { left: 0 !important; }
          .admin-overlay { display: block !important; }
          .admin-header { display: flex !important; }
          .sidebar-close { display: flex !important; }
          .admin-content { padding: 16px !important; }
        }
      `}</style>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────
function Dashboard() {
  const { products, categories, orders } = useAdminStore()
  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0)
  const stats = [
    { label: 'Total Products', value: products.length, icon: '📦', color: '#3b82f6' },
    { label: 'Categories', value: categories.length, icon: '🏷️', color: '#8b5cf6' },
    { label: 'Total Orders', value: orders.length, icon: '🛒', color: '#f59e0b' },
    { label: 'Revenue', value: `₹${revenue.toLocaleString('en-IN')}`, icon: '💰', color: '#22c55e' },
    { label: 'Pending Orders', value: orders.filter(o => o.status === 'Pending').length, icon: '⏳', color: '#ef4444' },
  ]
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '18px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
        <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Recent Orders</h3>
        {orders.slice(0, 5).map(o => (
          <div key={o.id || o.orderId} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
            <span style={{ fontWeight: 500 }}>{o.id || o.orderId}</span>
            <span>{o.customer?.name}</span>
            <span>₹{o.total}</span>
            <span style={{ color: o.status === 'Delivered' ? 'var(--success)' : o.status === 'Pending' ? '#f59e0b' : 'var(--primary)' }}>{o.status}</span>
          </div>
        ))}
        {orders.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No orders yet.</p>}
      </div>
    </div>
  )
}

// ── Product Manager ──────────────────────────────────────────
function ProductManager() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useAdminStore()
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const empty = { name: '', category: '', price: '', originalPrice: '', discount: 0, description: '', image: '', trending: false, topSelling: true, inStock: true }
  const [form, setForm] = useState(empty)

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  const openEdit = (p) => { setForm({ ...p }); setEditing(p.id) }
  const openAdd = () => { setForm(empty); setEditing('new') }

  const handleSave = () => {
    if (!form.name || !form.category || !form.price) { toast.error('Name, category and price are required'); return }
    const data = { ...form, price: +form.price, originalPrice: form.originalPrice ? +form.originalPrice : null, discount: +form.discount || 0, slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
    if (editing === 'new') { addProduct(data); toast.success('Product added!') }
    else { updateProduct(editing, data); toast.success('Product updated!') }
    setEditing(null)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setForm(p => ({ ...p, image: ev.target.result }))
    reader.readAsDataURL(file)
  }

  if (editing !== null) {
    return (
      <div>
        <button onClick={() => setEditing(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16 }}>← Back</button>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{editing === 'new' ? 'Add Product' : 'Edit Product'}</h2>
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', maxWidth: 700 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <FormField label="Product Name *" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
            <div>
              <label style={labelStyle}>Category *</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={inputStyle}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.slug || c.id}>{c.name}</option>)}
              </select>
            </div>
            <FormField label="Price (₹) *" type="number" value={form.price} onChange={v => setForm(p => ({ ...p, price: v }))} />
            <FormField label="Original Price (₹)" type="number" value={form.originalPrice || ''} onChange={v => setForm(p => ({ ...p, originalPrice: v }))} />
            <FormField label="Discount %" type="number" value={form.discount} onChange={v => setForm(p => ({ ...p, discount: v }))} />
            <FormField label="SKU / ID" value={form.sku || ''} onChange={v => setForm(p => ({ ...p, sku: v }))} />
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Product Image</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {form.image && <img src={form.image} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />}
              <div>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="prod-img" />
                <label htmlFor="prod-img" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--bg-secondary)', border: '1.5px dashed var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                  <Upload size={14} /> Upload Image
                </label>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Or paste URL:</p>
                <input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="https://..." style={{ ...inputStyle, marginTop: 4, fontSize: 12 }} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.trending} onChange={e => setForm(p => ({ ...p, trending: e.target.checked }))} />
              <TrendingUp size={14} color="var(--primary)" /> Trending
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.topSelling} onChange={e => setForm(p => ({ ...p, topSelling: e.target.checked }))} />
              <Award size={14} color="var(--accent)" /> Top Selling
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.inStock} onChange={e => setForm(p => ({ ...p, inStock: e.target.checked }))} />
              In Stock
            </label>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button onClick={handleSave} className="btn btn-primary"><Save size={14} /> Save Product</button>
            <button onClick={() => setEditing(null)} className="btn btn-outline"><X size={14} /> Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Products ({filtered.length})</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            style={{ padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', width: 200 }} />
          <button onClick={openAdd} className="btn btn-primary"><Plus size={14} /> Add Product</button>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
          <thead style={{ background: '#f9f9f9' }}>
            <tr>{['Image', 'Name', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
              <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '10px 14px' }}>
                  <img src={p.image} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} onError={e => e.target.style.display = 'none'} />
                </td>
                <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500, maxWidth: 200 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{p.category}</td>
                <td style={{ padding: '10px 14px', fontSize: 14, fontWeight: 600 }}>₹{p.price}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 10, background: p.inStock ? '#dcfce7' : '#fee2e2', color: p.inStock ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                    {p.inStock ? 'In Stock' : 'Out'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(p)} style={{ padding: '5px 10px', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Edit3 size={12} /> Edit</button>
                    <button onClick={() => { deleteProduct(p.id); toast.success('Deleted') }} style={{ padding: '5px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No products found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Category Manager ─────────────────────────────────────────
function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useAdminStore()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', image: '' })

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Name required'); return }
    if (editing === 'new') { addCategory(form); toast.success('Category added!') }
    else { updateCategory(editing, form); toast.success('Updated!') }
    setEditing(null)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(p => ({ ...p, image: ev.target.result }))
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Categories ({categories.length})</h2>
        <button onClick={() => { setForm({ name: '', image: '' }); setEditing('new') }} className="btn btn-primary"><Plus size={14} /> Add Category</button>
      </div>
      {editing !== null && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', maxWidth: 500 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{editing === 'new' ? 'Add Category' : 'Edit Category'}</h3>
          <FormField label="Category Name *" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Category Image</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {form.image && <img src={form.image} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />}
              <div>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="cat-img" />
                <label htmlFor="cat-img" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--bg-secondary)', border: '1.5px dashed var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                  <Upload size={13} /> Upload
                </label>
              </div>
            </div>
            <input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="Or paste image URL" style={{ ...inputStyle, marginTop: 8, fontSize: 12 }} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={handleSave} className="btn btn-primary"><Save size={14} /> Save</button>
            <button onClick={() => setEditing(null)} className="btn btn-outline"><X size={14} /> Cancel</button>
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {categories.map(cat => (
          <div key={cat.id} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ height: 90, background: '#f5f5f5' }}>
              {cat.image && <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div style={{ padding: '10px 12px' }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{cat.name}</p>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setForm({ name: cat.name, image: cat.image }); setEditing(cat.id) }} style={{ flex: 1, padding: '5px', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit3 size={11} /></button>
                <button onClick={() => { deleteCategory(cat.id); toast.success('Deleted') }} style={{ flex: 1, padding: '5px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={11} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Banner Manager ────────────────────────────────────────────
function BannerManager() {
  const { banners, addBanner, deleteBanner, siteConfig, updateSiteConfig } = useAdminStore()
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '/categories' })
  const [showAdd, setShowAdd] = useState(false)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(p => ({ ...p, image: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const handleAdd = () => {
    if (!form.image) { toast.error('Image required'); return }
    addBanner(form)
    setForm({ title: '', subtitle: '', image: '', link: '/categories' })
    setShowAdd(false); toast.success('Banner added!')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Banners ({banners.length})</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn btn-primary"><Plus size={14} /> Add Banner</button>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Homepage Section Controls</h3>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[{ key: 'showHeroBanner', label: 'Hero Banner' }, { key: 'showAdminSection', label: 'Admin Section' }].map(s => (
            <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div onClick={() => updateSiteConfig({ [s.key]: !siteConfig[s.key] })}
                style={{ width: 44, height: 24, borderRadius: 12, background: siteConfig[s.key] !== false ? 'var(--success)' : '#ccc', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', width: 18, height: 18, background: '#fff', borderRadius: '50%', top: 3, left: siteConfig[s.key] !== false ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
              <span style={{ fontSize: 14 }}>{s.label} — <strong>{siteConfig[s.key] !== false ? 'Visible' : 'Hidden'}</strong></span>
            </label>
          ))}
        </div>
      </div>
      {showAdd && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, maxWidth: 560 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>New Banner</h3>
          <FormField label="Title" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} />
          <FormField label="Subtitle" value={form.subtitle} onChange={v => setForm(p => ({ ...p, subtitle: v }))} />
          <FormField label="Link URL" value={form.link} onChange={v => setForm(p => ({ ...p, link: v }))} />
          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Banner Image *</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="banner-img" />
            <label htmlFor="banner-img" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--bg-secondary)', border: '1.5px dashed var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
              <Upload size={13} /> Upload Image
            </label>
            <input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="Or paste image URL" style={{ ...inputStyle, marginTop: 8, fontSize: 12 }} />
            {form.image && <img src={form.image} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} onError={e => e.target.style.display = 'none'} />}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={handleAdd} className="btn btn-primary"><Plus size={14} /> Add</button>
            <button onClick={() => setShowAdd(false)} className="btn btn-outline"><X size={14} /> Cancel</button>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {banners.map(b => (
          <div key={b.id} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 140, height: 72, background: '#f5f5f5', flexShrink: 0 }}>
              <img src={b.image} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
            </div>
            <div style={{ flex: 1, padding: '10px 14px' }}>
              <p style={{ fontWeight: 600, fontSize: 13 }}>{b.title || 'No title'}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.link}</p>
            </div>
            <div style={{ padding: '0 14px' }}>
              <button onClick={() => { deleteBanner(b.id); toast.success('Removed') }} style={{ padding: '6px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Order Manager — Bug #9: show payment screenshot ──────────
function OrderManager() {
  const { orders, updateOrderStatus } = useAdminStore()
  const statuses = ['Pending', 'Packed', 'Shipped', 'Delivered', 'Cancelled']
  const statusColors = { Pending: '#f59e0b', Packed: '#3b82f6', Shipped: '#8b5cf6', Delivered: '#22c55e', Cancelled: '#ef4444' }
  const [viewScreenshot, setViewScreenshot] = useState(null)

  const exportCSV = () => {
    const rows = [['Order ID', 'Customer', 'Phone', 'Email', 'Address', 'Items', 'Total', 'Status', 'Date']]
    orders.forEach(o => rows.push([o.id || o.orderId, o.customer?.name, o.customer?.phone, o.customer?.email, `${o.customer?.address} ${o.customer?.city}`, o.items?.length, o.total, o.status, new Date(o.createdAt).toLocaleDateString('en-IN')]))
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'orders.csv'; a.click()
  }

  return (
    <div>
      {/* Screenshot lightbox */}
      {viewScreenshot && (
        <div onClick={() => setViewScreenshot(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ position: 'relative', maxWidth: 600, width: '100%' }}>
            <button onClick={() => setViewScreenshot(null)}
              style={{ position: 'absolute', top: -40, right: 0, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>✕ Close</button>
            <img src={viewScreenshot} alt="Payment Screenshot" style={{ width: '100%', borderRadius: 12, boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Orders ({orders.length})</h2>
        <button onClick={exportCSV} className="btn btn-outline"><Download size={14} /> Export CSV</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {orders.length === 0 && <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', background: '#fff', borderRadius: 12 }}>No orders yet.</div>}
        {orders.map(o => (
          <div key={o.id || o.orderId} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{o.id || o.orderId}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ background: (statusColors[o.status] || '#ccc') + '20', color: statusColors[o.status] || '#666', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{o.status}</span>
                <select value={o.status} onChange={e => updateOrderStatus(o.id || o.orderId, e.target.value)}
                  style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer' }}>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10, fontSize: 13, background: '#f9f9f9', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Customer: </span><strong>{o.customer?.name}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Phone: </span>{o.customer?.phone}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Email: </span>{o.customer?.email}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>City: </span>{o.customer?.city}{o.customer?.pincode && ` - ${o.customer.pincode}`}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Address: </span>{o.customer?.address}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Total: </span><strong style={{ color: 'var(--primary)' }}>₹{o.total}</strong></div>
            </div>

            {/* Items */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {o.items?.map((item, idx) => (
                <span key={idx} style={{ fontSize: 12, background: 'var(--bg-secondary)', padding: '3px 10px', borderRadius: 20 }}>{item.name} ×{item.qty}</span>
              ))}
            </div>

            {/* Bug #9: Payment screenshot */}
            {o.paymentScreenshot && (
              <div style={{ marginTop: 10 }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>💳 Payment Screenshot:</p>
                <img
                  src={o.paymentScreenshot}
                  alt="Payment proof"
                  onClick={() => setViewScreenshot(o.paymentScreenshot)}
                  style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--border)', cursor: 'zoom-in', transition: 'transform 0.2s' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Click to view full size</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── User Manager ──────────────────────────────────────────────
function UserManager() {
  const { users } = useAuthStore()
  const { activeCarts } = useAdminStore()
  const customers = users.filter(u => u.role !== 'admin')

  const getCartForUser = (userId, phone) =>
    activeCarts?.find(c => c.userId === userId || c.userId === phone)

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Customers ({customers.length})</h2>
      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', overflowX: 'auto', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead style={{ background: '#f9f9f9' }}>
            <tr>{['Name', 'Phone', 'Email', 'Address', 'Active Cart', 'Joined'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                No customers yet. Customers appear here after they sign up.
              </td></tr>
            )}
            {customers.map(u => {
              const cart = getCartForUser(u.id, u.phone)
              const cartCount = cart?.items?.reduce((s, i) => s + (i.qty || 0), 0) || 0
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500 }}>{u.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{u.phone}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{u.email || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', maxWidth: 160 }}>{u.address || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>
                    {cartCount > 0
                      ? <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>🛒 {cartCount} item{cartCount !== 1 ? 's' : ''}</span>
                      : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Empty</span>
                    }
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Team Manager ──────────────────────────────────────────────
function TeamManager() {
  const { siteConfig, updateSiteConfig } = useAdminStore()
  const team = siteConfig.teamMembers || []
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', designation: '', description: '', image: '' })

  const handleImageUpload = (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(p => ({ ...p, image: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    let updated
    if (editing === 'new') updated = [...team, { ...form, id: Date.now() }]
    else updated = team.map(m => m.id === editing ? { ...m, ...form } : m)
    updateSiteConfig({ teamMembers: updated })
    setEditing(null)
    toast.success(editing === 'new' ? 'Team member added!' : 'Updated!')
  }

  const handleDelete = (id) => {
    updateSiteConfig({ teamMembers: team.filter(m => m.id !== id) })
    toast.success('Removed')
  }

  const openEdit = (m) => {
    setForm({ name: m.name, designation: m.designation || '', description: m.description || '', image: m.image || '' })
    setEditing(m.id)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Team Members</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Shown on About Us page — 2 cards per row</p>
        </div>
        <button onClick={() => { setForm({ name: '', designation: '', description: '', image: '' }); setEditing('new') }} className="btn btn-primary"><Plus size={14} /> Add Member</button>
      </div>

      {editing !== null && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', maxWidth: 520 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{editing === 'new' ? 'Add Team Member' : 'Edit Member'}</h3>
          <FormField label="Full Name *" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
          <FormField label="Designation" value={form.designation} onChange={v => setForm(p => ({ ...p, designation: v }))} placeholder="e.g. Founder & CEO" />
          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Short Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="A short bio..." />
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Profile Photo</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {form.image && <img src={form.image} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--primary)' }} />}
              <div>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="team-img" />
                <label htmlFor="team-img" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--bg-secondary)', border: '1.5px dashed var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                  <Upload size={13} /> Upload Photo
                </label>
                <input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="Or paste image URL" style={{ ...inputStyle, marginTop: 6, fontSize: 12 }} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={handleSave} className="btn btn-primary"><Save size={14} /> Save</button>
            <button onClick={() => setEditing(null)} className="btn btn-outline"><X size={14} /> Cancel</button>
          </div>
        </div>
      )}

      {team.length === 0 && editing === null && (
        <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: 12, color: 'var(--text-muted)' }}>
          No team members added yet.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {team.map(m => (
          <div key={m.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ height: 100, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {m.image ? <img src={m.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 700 }}>{m.name?.[0] || '?'}</div>
              )}
            </div>
            <div style={{ padding: 14 }}>
              <p style={{ fontWeight: 700, marginBottom: 2 }}>{m.name}</p>
              <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500, marginBottom: 6 }}>{m.designation}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{m.description}</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <button onClick={() => openEdit(m)} style={{ flex: 1, padding: '5px', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Edit3 size={11} /> Edit</button>
                <button onClick={() => handleDelete(m.id)} style={{ flex: 1, padding: '5px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Trash2 size={11} /> Del</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── CMS Manager ───────────────────────────────────────────────
function CMSManager() {
  const { siteConfig, updateSiteConfig } = useAdminStore()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    aboutHeroTitle: siteConfig.aboutHeroTitle || '',
    aboutHeroSubtitle: siteConfig.aboutHeroSubtitle || '',
    aboutStoryTitle: siteConfig.aboutStoryTitle || '',
    aboutUs: siteConfig.aboutUs || '',
    aboutMission: siteConfig.aboutMission || '',
    aboutVision: siteConfig.aboutVision || '',
    termsContent: siteConfig.termsContent || '',
    privacyContent: siteConfig.privacyContent || '',
    refundContent: siteConfig.refundContent || '',
    shippingContent: siteConfig.shippingContent || '',
  })

  const handleSave = () => {
    updateSiteConfig(form); setSaved(true); toast.success('Content saved!')
    setTimeout(() => setSaved(false), 2000)
  }

  const Field = ({ label, field, rows = 3, placeholder }) => (
    <div style={{ marginBottom: 20 }}>
      <label style={labelStyle}>{label}</label>
      {rows === 1 ? (
        <input value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} placeholder={placeholder} style={inputStyle} />
      ) : (
        <textarea value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} rows={rows} placeholder={placeholder} style={{ ...inputStyle, resize: 'vertical' }} />
      )}
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Content Management (CMS)</h2>
        <button onClick={handleSave} className="btn btn-primary" style={{ minWidth: 120 }}>
          {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save All</>}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15, color: 'var(--primary)' }}>About Us Page</h3>
          <Field label="Hero Title" field="aboutHeroTitle" rows={1} />
          <Field label="Hero Subtitle" field="aboutHeroSubtitle" rows={1} />
          <Field label="Story Section Title" field="aboutStoryTitle" rows={1} />
          <Field label="About Us Content" field="aboutUs" rows={4} />
          <Field label="Mission Statement" field="aboutMission" rows={3} />
          <Field label="Vision Statement" field="aboutVision" rows={3} />
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15, color: 'var(--primary)' }}>Policy Pages</h3>
          <Field label="Terms & Conditions" field="termsContent" rows={5} />
          <Field label="Privacy Policy" field="privacyContent" rows={5} />
          <Field label="Return & Refund Policy" field="refundContent" rows={5} />
          <Field label="Shipping Policy" field="shippingContent" rows={5} />
        </div>
      </div>
    </div>
  )
}

// ── Site Settings — Bug #8: QR code upload ───────────────────
function SiteSettings() {
  const { siteConfig, updateSiteConfig } = useAdminStore()
  const { updateUser, user } = useAuthStore()
  const [form, setForm] = useState({ ...siteConfig })
  const [saved, setSaved] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [showPw, setShowPw] = useState(false)

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(p => ({ ...p, logo: ev.target.result }))
    reader.readAsDataURL(file)
  }

  // Bug #8: QR code upload handler
  const handleQrUpload = (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(p => ({ ...p, paymentQrCode: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    updateSiteConfig(form); setSaved(true); toast.success('Settings saved!')
    setTimeout(() => setSaved(false), 2000)
  }

  const handleChangePassword = () => {
    setPwError('')
    const currentStoredPw = localStorage.getItem('admin-pw') || 'admin123'
    if (pwForm.current !== currentStoredPw) { setPwError('Current password is incorrect'); return }
    if (pwForm.newPw.length < 6) { setPwError('Min 6 characters'); return }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match'); return }
    localStorage.setItem('admin-pw', pwForm.newPw)
    updateUser({ id: 'admin', role: 'admin', password: pwForm.newPw })
    setPwForm({ current: '', newPw: '', confirm: '' })
    toast.success('Password changed! Use the new password on next login.')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Site Settings</h2>
        <button onClick={handleSave} className="btn btn-primary">
          {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Settings</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>

        {/* Branding */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>🎨 Branding</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Store Logo</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
              {form.logo && <img src={form.logo} style={{ height: 48, maxWidth: 160, objectFit: 'contain', border: '1px solid var(--border)', borderRadius: 8, padding: 4 }} />}
              <div>
                <input type="file" accept="image/png,image/svg+xml,image/jpg,image/jpeg" onChange={handleLogoUpload} style={{ display: 'none' }} id="logo-up" />
                <label htmlFor="logo-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--bg-secondary)', border: '1.5px dashed var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                  <Upload size={13} /> Upload Logo
                </label>
              </div>
            </div>
            {form.logo && <button onClick={() => setForm(p => ({ ...p, logo: null }))} style={{ fontSize: 12, color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>Remove logo</button>}
          </div>
          <FormField label="Store Name" value={form.storeName} onChange={v => setForm(p => ({ ...p, storeName: v }))} />
          <FormField label="Tagline" value={form.tagline} onChange={v => setForm(p => ({ ...p, tagline: v }))} />
          <FormField label="Announcement Bar" value={form.announcement} onChange={v => setForm(p => ({ ...p, announcement: v }))} />
        </div>

        {/* Contact */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>📞 Contact Info</h3>
          <FormField label="Contact Email" value={form.contactEmail} onChange={v => setForm(p => ({ ...p, contactEmail: v }))} type="email" />
          <FormField label="Contact Phone" value={form.contactPhone} onChange={v => setForm(p => ({ ...p, contactPhone: v }))} />
          <FormField label="WhatsApp Number (country code, no +)" value={form.whatsappNumber} onChange={v => setForm(p => ({ ...p, whatsappNumber: v }))} placeholder="919876543210" />
          <FormField label="Address" value={form.address} onChange={v => setForm(p => ({ ...p, address: v }))} />
        </div>

        {/* Bug #8: Payment QR Code — manageable from admin */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 15 }}>💳 Payment QR Code</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            This QR code is shown to customers when they place an order. They scan it, pay, then upload a screenshot to confirm.
          </p>
          {form.paymentQrCode && (
            <div style={{ marginBottom: 12 }}>
              <img src={form.paymentQrCode} alt="Payment QR"
                style={{ width: 160, height: 160, objectFit: 'contain', border: '2px solid var(--border)', borderRadius: 12, padding: 8, display: 'block' }} />
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleQrUpload} style={{ display: 'none' }} id="qr-up" />
          <label htmlFor="qr-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--bg-secondary)', border: '1.5px dashed var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
            <QrCode size={14} /> {form.paymentQrCode ? 'Change QR Code' : 'Upload QR Code'}
          </label>
          {form.paymentQrCode && (
            <button onClick={() => setForm(p => ({ ...p, paymentQrCode: null }))}
              style={{ display: 'block', marginTop: 8, fontSize: 12, color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Remove QR
            </button>
          )}
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
            💡 Tip: Export your UPI QR from Google Pay, PhonePe, or Paytm and upload it here.
          </p>
        </div>

        {/* Social */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>🌐 Social Media</h3>
          {[{ key: 'instagram', label: 'Instagram URL' }, { key: 'facebook', label: 'Facebook URL' }, { key: 'youtube', label: 'YouTube URL' }].map(s => (
            <FormField key={s.key} label={s.label} value={form.social?.[s.key] || ''} onChange={v => setForm(p => ({ ...p, social: { ...p.social, [s.key]: v } }))} placeholder="https://..." />
          ))}
        </div>

        {/* Notifications */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 15 }}>🔔 Order Notifications (Free)</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
            WhatsApp: opens WhatsApp with full order details (free).<br />
            Email: uses free EmailJS (200/month).
          </p>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.notifyWhatsapp !== false} onChange={e => setForm(p => ({ ...p, notifyWhatsapp: e.target.checked }))} />
            Notify via WhatsApp
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.notifyEmail === true} onChange={e => setForm(p => ({ ...p, notifyEmail: e.target.checked }))} />
            Notify via Email (EmailJS)
          </label>
          {form.notifyEmail && (
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                Sign up free at <a href="https://emailjs.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>emailjs.com</a>
              </p>
              <FormField label="EmailJS Service ID" value={form.emailjsServiceId || ''} onChange={v => setForm(p => ({ ...p, emailjsServiceId: v }))} />
              <FormField label="EmailJS Template ID" value={form.emailjsTemplateId || ''} onChange={v => setForm(p => ({ ...p, emailjsTemplateId: v }))} />
              <FormField label="EmailJS Public Key" value={form.emailjsPublicKey || ''} onChange={v => setForm(p => ({ ...p, emailjsPublicKey: v }))} />
            </div>
          )}
        </div>

        {/* Change Password */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 15 }}>🔐 Change Admin Password</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Default: admin123 — change after first login.</p>
          {[{ key: 'current', label: 'Current Password' }, { key: 'newPw', label: 'New Password (min 6)' }, { key: 'confirm', label: 'Confirm New Password' }].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label style={labelStyle}>{f.label}</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))} style={inputStyle} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}
          {pwError && <p style={{ fontSize: 12, color: 'var(--error)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><AlertCircle size={12} /> {pwError}</p>}
          <button onClick={handleChangePassword} className="btn btn-primary" style={{ marginTop: 4 }}>
            <Lock size={14} /> Update Password
          </button>
        </div>

        {/* Pricing Audit */}
        <PricingAudit />

      </div>
    </div>
  )
}

// ── Pricing Audit ────────────────────────────────────────────
// Base prices from products.json (seed data — before any adjustments)
const BASE_PRICES = {
  'SKU-0001': 24, 'SKU-0002': 33, 'SKU-0003': 24, 'SKU-0004': 27,
  'SKU-0005': 150, 'SKU-0006': 185, 'SKU-0007': 249, 'SKU-0008': 120,
  'SKU-0009': 95, 'SKU-0010': 110, 'SKU-0011': 26, 'SKU-0012': 33,
}

function PricingAudit() {
  const { products } = useAdminStore()
  const [applied, setApplied] = useState(null)

  // Check if ₹5 has already been added by comparing 3 sample products
  const samples = Object.entries(BASE_PRICES).slice(0, 3).map(([id, base]) => {
    const live = products.find(p => p.id === id)
    return { id, base, live: live?.price, diff: live ? live.price - base : null }
  })
  const avgDiff = samples.filter(s => s.diff !== null).reduce((a, b) => a + b.diff, 0) / samples.filter(s => s.diff !== null).length
  const alreadyApplied = Math.abs(avgDiff - 5) < 1   // within ₹1 of expected diff

  const handleApply = async () => {
    const API = import.meta.env.VITE_API_URL
    if (!API) { toast.error('Backend API not configured (VITE_API_URL missing)'); return }
    try {
      const res = await fetch(`${API}/api/update-prices?add=5`)
      const data = await res.json()
      toast.success(data.message || '₹5 applied to all prices!')
      setApplied(true)
    } catch { toast.error('Failed to apply price update. Check backend.') }
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
      <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 15 }}>💰 Pricing Audit — ₹5 Increase Check</h3>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
        Compares live product prices against the original seed data to detect if the ₹5 increase was already applied.
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
        <thead>
          <tr style={{ background: '#f9f9f9' }}>
            {['Product ID', 'Base Price (seed)', 'Live Price (DB)', 'Difference'].map(h => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {samples.map(s => (
            <tr key={s.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
              <td style={{ padding: '8px 12px', fontWeight: 500 }}>{s.id}</td>
              <td style={{ padding: '8px 12px' }}>₹{s.base}</td>
              <td style={{ padding: '8px 12px' }}>{s.live !== undefined ? `₹${s.live}` : <span style={{ color: 'var(--text-muted)' }}>Not in DB</span>}</td>
              <td style={{ padding: '8px 12px', fontWeight: 600, color: s.diff >= 5 ? 'var(--success)' : s.diff > 0 ? '#f59e0b' : 'var(--error)' }}>
                {s.diff !== null ? (s.diff > 0 ? `+₹${s.diff}` : `₹${s.diff}`) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {samples.some(s => s.live !== undefined) && (
        <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: alreadyApplied ? '#f0fdf4' : '#fff7ed', border: `1px solid ${alreadyApplied ? '#bbf7d0' : '#fed7aa'}` }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: alreadyApplied ? '#166534' : '#92400e' }}>
            {alreadyApplied
              ? '✅ ₹5 increase already applied — do NOT apply again.'
              : '⚠️ ₹5 increase NOT detected. Safe to apply below.'}
          </p>
        </div>
      )}

      {!alreadyApplied && !applied && (
        <button onClick={handleApply} className="btn btn-primary" style={{ fontSize: 13 }}>
          Apply ₹5 to All Product Prices
        </button>
      )}
      {applied && (
        <p style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>✅ ₹5 increase applied! Refresh to see updated prices.</p>
      )}
    </div>
  )
}

// ── Shared helpers ────────────────────────────────────────────
const labelStyle = { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5, color: 'var(--text)' }
const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box' }

function FormField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={inputStyle}
        onFocus={e => e.target.style.borderColor = 'var(--primary)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
    </div>
  )
}
