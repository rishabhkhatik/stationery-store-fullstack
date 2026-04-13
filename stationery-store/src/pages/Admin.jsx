import React, { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tag, Image, ShoppingBag, Users, Settings,
  Plus, Trash2, Edit3, Save, X, Eye, EyeOff, Upload, LogOut,
  TrendingUp, Award, Download, Check, AlertCircle, Lock
} from 'lucide-react'
import { useAdminStore, useAuthStore } from '../store'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'banners', label: 'Banners', icon: Image },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'team', label: 'Team Members', icon: Users },
  { id: 'cms', label: 'Content / CMS', icon: Settings },
  { id: 'settings', label: 'Site Settings', icon: Settings },
]

export default function AdminPanel() {
  const { user, isLoggedIn, logout } = useAuthStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState('dashboard')

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f8' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: '#1e1e2d', color: '#c9c9d3', flexShrink: 0, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 2 }}>🛍️ Admin Panel</div>
          <div style={{ fontSize: 12, color: '#888' }}>{user?.email}</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
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
      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 28px' }}>
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'products' && <ProductManager />}
        {tab === 'categories' && <CategoryManager />}
        {tab === 'banners' && <BannerManager />}
        {tab === 'orders' && <OrderManager />}
        {tab === 'users' && <UserManager />}
        {tab === 'team' && <TeamManager />}
        {tab === 'cms' && <CMSManager />}
        {tab === 'settings' && <SiteSettings />}
      </main>
    </div>
  )
}

// ── Dashboard ────────────────────────────────────────────────
function Dashboard() {
  const { products, categories, orders } = useAdminStore()
  const { users } = useAuthStore()
  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0)
  const stats = [
    { label: 'Total Products', value: products.length, icon: '📦', color: '#3b82f6' },
    { label: 'Categories', value: categories.length, icon: '🏷️', color: '#8b5cf6' },
    { label: 'Total Orders', value: orders.length, icon: '🛒', color: '#f59e0b' },
    { label: 'Revenue', value: `₹${revenue.toLocaleString('en-IN')}`, icon: '💰', color: '#22c55e' },
    { label: 'Customers', value: users.filter(u => u.role !== 'admin').length, icon: '👥', color: '#e84393' },
    { label: 'Pending Orders', value: orders.filter(o => o.status === 'Pending').length, icon: '⏳', color: '#ef4444' },
  ]
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Recent Orders</h3>
        {orders.slice(0, 5).map(o => (
          <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
            <span style={{ fontWeight: 500 }}>{o.id}</span>
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
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setForm(p => ({ ...p, image: ev.target.result }))
    reader.readAsDataURL(file)
  }

  if (editing !== null) {
    return (
      <div>
        <button onClick={() => setEditing(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16 }}>← Back</button>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>{editing === 'new' ? 'Add New Product' : 'Edit Product'}</h2>
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', maxWidth: 700 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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
          <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.trending} onChange={e => setForm(p => ({ ...p, trending: e.target.checked }))} />
              <TrendingUp size={14} color="var(--primary)" /> Mark as Trending
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.topSelling} onChange={e => setForm(p => ({ ...p, topSelling: e.target.checked }))} />
              <Award size={14} color="var(--accent)" /> Mark as Top Selling
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.inStock} onChange={e => setForm(p => ({ ...p, inStock: e.target.checked }))} />
              In Stock
            </label>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
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
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Products ({products.length})</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, outline: 'none' }} />
          <button onClick={openAdd} className="btn btn-primary"><Plus size={14} /> Add Product</button>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9f9f9' }}>
            <tr>{['Image', 'Name', 'Category', 'Price', 'Tags', 'Actions'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                <td style={{ padding: '10px 16px' }}><img src={p.image} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} onError={e => e.target.src = 'https://via.placeholder.com/44'} /></td>
                <td style={{ padding: '10px 16px', fontSize: 14, fontWeight: 500, maxWidth: 200 }}>{p.name}</td>
                <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{p.category}</td>
                <td style={{ padding: '10px 16px', fontSize: 14, fontWeight: 600 }}>₹{p.price}</td>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {p.trending && <span style={{ fontSize: 10, background: '#fce4f0', color: 'var(--primary)', padding: '2px 6px', borderRadius: 10, fontWeight: 600 }}>Trending</span>}
                    {p.topSelling && <span style={{ fontSize: 10, background: '#dcfce7', color: '#16a34a', padding: '2px 6px', borderRadius: 10, fontWeight: 600 }}>Top Sell</span>}
                  </div>
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(p)} style={{ padding: '5px 10px', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Edit3 size={12} /></button>
                    <button onClick={() => { deleteProduct(p.id); toast.success('Deleted') }} style={{ padding: '5px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No products found</div>}
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
    const file = e.target.files[0]
    if (!file) return
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {categories.map(cat => (
          <div key={cat.id} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ height: 90, background: '#f5f5f5', overflow: 'hidden' }}>
              {cat.image && <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div style={{ padding: '10px 12px' }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>{cat.name}</p>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setForm({ name: cat.name, image: cat.image }); setEditing(cat.id) }}
                  style={{ flex: 1, padding: '5px', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit3 size={11} />
                </button>
                <button onClick={() => { deleteCategory(cat.id); toast.success('Deleted') }}
                  style={{ flex: 1, padding: '5px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Banner Manager ───────────────────────────────────────────
function BannerManager() {
  const { banners, addBanner, updateBanner, deleteBanner, siteConfig, updateSiteConfig } = useAdminStore()
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '/categories' })
  const [showAdd, setShowAdd] = useState(false)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(p => ({ ...p, image: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const handleAdd = () => {
    if (!form.image) { toast.error('Image required'); return }
    addBanner(form)
    setForm({ title: '', subtitle: '', image: '', link: '/categories' })
    setShowAdd(false)
    toast.success('Banner added!')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Banners ({banners.length})</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn btn-primary"><Plus size={14} /> Add Banner</button>
      </div>

      {/* Hero section visibility toggle */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Homepage Section Controls</h3>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { key: 'showHeroBanner', label: 'Hero Banner (Shop Now)' },
            { key: 'showAdminSection', label: 'Admin/Login Section' },
          ].map(s => (
            <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div onClick={() => updateSiteConfig({ [s.key]: !siteConfig[s.key] })}
                style={{ width: 44, height: 24, borderRadius: 12, background: siteConfig[s.key] !== false ? 'var(--success)' : '#ccc', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', width: 18, height: 18, background: '#fff', borderRadius: '50%', top: 3, left: siteConfig[s.key] !== false ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
              <span style={{ fontSize: 14 }}>{s.label} — <strong>{siteConfig[s.key] !== false ? 'Visible' : 'Hidden'}</strong></span>
            </label>
          ))}
        </div>
      </div>

      {showAdd && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', maxWidth: 560 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>New Banner</h3>
          <FormField label="Title" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} />
          <FormField label="Subtitle" value={form.subtitle} onChange={v => setForm(p => ({ ...p, subtitle: v }))} />
          <FormField label="Link URL" value={form.link} onChange={v => setForm(p => ({ ...p, link: v }))} />
          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Banner Image *</label>
            <input type="file" accept="image/*,video/*" onChange={handleImageUpload} style={{ display: 'none' }} id="banner-img" />
            <label htmlFor="banner-img" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--bg-secondary)', border: '1.5px dashed var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
              <Upload size={13} /> Upload Image / Video
            </label>
            <input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="Or paste image URL" style={{ ...inputStyle, marginTop: 8, fontSize: 12 }} />
            {form.image && <img src={form.image} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} onError={e => e.target.style.display = 'none'} />}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={handleAdd} className="btn btn-primary"><Plus size={14} /> Add Banner</button>
            <button onClick={() => setShowAdd(false)} className="btn btn-outline"><X size={14} /> Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {banners.map((b, i) => (
          <div key={b.id} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 0 }}>
            <div style={{ width: 160, height: 80, background: '#f5f5f5', flexShrink: 0 }}>
              <img src={b.image} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
            </div>
            <div style={{ flex: 1, padding: '12px 16px' }}>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{b.title || 'No title'}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.subtitle} · {b.link}</p>
            </div>
            <div style={{ padding: '0 16px', display: 'flex', gap: 8 }}>
              <button onClick={() => { deleteBanner(b.id); toast.success('Banner removed') }}
                style={{ padding: '6px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Order Manager ────────────────────────────────────────────
function OrderManager() {
  const { orders, updateOrderStatus } = useAdminStore()
  const statuses = ['Pending', 'Packed', 'Shipped', 'Delivered', 'Cancelled']
  const statusColors = { Pending: '#f59e0b', Packed: '#3b82f6', Shipped: '#8b5cf6', Delivered: '#22c55e', Cancelled: '#ef4444' }

  const exportCSV = () => {
    const rows = [['Order ID', 'Customer', 'Phone', 'Email', 'City', 'Items', 'Total', 'Status', 'Date']]
    orders.forEach(o => rows.push([o.id, o.customer?.name, o.customer?.phone, o.customer?.email, o.customer?.city, o.items?.length, o.total, o.status, new Date(o.createdAt).toLocaleDateString('en-IN')]))
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'orders.csv'
    a.click()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Orders ({orders.length})</h2>
        <button onClick={exportCSV} className="btn btn-outline"><Download size={14} /> Export CSV</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {orders.length === 0 && <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', background: '#fff', borderRadius: 12 }}>No orders yet.</div>}
        {orders.map(o => (
          <div key={o.id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{o.id}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ background: (statusColors[o.status] || '#ccc') + '20', color: statusColors[o.status] || '#666', padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{o.status}</span>
                <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                  style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer' }}>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 13, background: '#f9f9f9', borderRadius: 8, padding: 12 }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Customer:</span> <strong>{o.customer?.name}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> {o.customer?.phone}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> {o.customer?.email}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>City:</span> {o.customer?.city} - {o.customer?.pincode}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Address:</span> {o.customer?.address}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Total:</span> <strong>₹{o.total}</strong></div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {o.items?.map(item => (
                <span key={item.id} style={{ fontSize: 12, background: 'var(--bg-secondary)', padding: '3px 10px', borderRadius: 20 }}>{item.name} ×{item.qty}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── User Manager ─────────────────────────────────────────────
function UserManager() {
  const { users, updateUser } = useAuthStore()
  const customers = users.filter(u => u.role !== 'admin')
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Customers ({customers.length})</h2>
      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9f9f9' }}>
            <tr>{['Name', 'Email', 'Phone', 'Joined', 'Status'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {customers.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500 }}>{u.name}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{u.email}</td>
                <td style={{ padding: '12px 16px', fontSize: 13 }}>{u.phone}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => updateUser({ id: u.id, blocked: !u.blocked })}
                    style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', background: u.blocked ? '#dcfce7' : '#fee2e2', color: u.blocked ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                    {u.blocked ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No customers registered yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Team Members Manager ─────────────────────────────────────
function TeamManager() {
  const { siteConfig, updateSiteConfig } = useAdminStore()
  const team = siteConfig.teamMembers || []
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', designation: '', description: '', image: '' })

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
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

  const openEdit = (m) => { setForm({ name: m.name, designation: m.designation, description: m.description, image: m.image }); setEditing(m.id) }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Team Members</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Shown on About Us page — max 2 per row, Load More after 4</p>
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
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
              style={{ ...inputStyle, resize: 'vertical' }} placeholder="A short bio..." />
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
          No team members added yet. Add your first member to show on the About Us page.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {team.map(m => (
          <div key={m.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ height: 100, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {m.image ? <img src={m.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 700 }}>{m.name[0]}</div>
              )}
            </div>
            <div style={{ padding: 14 }}>
              <p style={{ fontWeight: 700, marginBottom: 2 }}>{m.name}</p>
              <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500, marginBottom: 6 }}>{m.designation}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{m.description}</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <button onClick={() => openEdit(m)} style={{ flex: 1, padding: '5px', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Edit3 size={11} /> Edit</button>
                <button onClick={() => handleDelete(m.id)} style={{ flex: 1, padding: '5px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Trash2 size={11} /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── CMS Manager ──────────────────────────────────────────────
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
    updateSiteConfig(form)
    setSaved(true)
    toast.success('Content saved!')
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15, color: 'var(--primary)' }}>About Us Page</h3>
          <Field label="Hero Title" field="aboutHeroTitle" rows={1} placeholder="e.g. About Us" />
          <Field label="Hero Subtitle" field="aboutHeroSubtitle" rows={1} placeholder="e.g. Your trusted stationery partner" />
          <Field label="Our Story Section Title" field="aboutStoryTitle" rows={1} placeholder="e.g. Our Story" />
          <Field label="About Us Content" field="aboutUs" rows={4} placeholder="Tell your story..." />
          <Field label="Mission Statement" field="aboutMission" rows={3} placeholder="Our mission..." />
          <Field label="Vision Statement" field="aboutVision" rows={3} placeholder="Our vision..." />
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15, color: 'var(--primary)' }}>Policy Pages</h3>
          <Field label="Terms & Conditions" field="termsContent" rows={5} placeholder="Enter terms..." />
          <Field label="Privacy Policy" field="privacyContent" rows={5} placeholder="Enter privacy policy..." />
          <Field label="Return & Refund Policy" field="refundContent" rows={5} placeholder="Enter refund policy..." />
          <Field label="Shipping Policy" field="shippingContent" rows={5} placeholder="Enter shipping policy..." />
        </div>
      </div>
    </div>
  )
}

// ── Site Settings ────────────────────────────────────────────
function SiteSettings() {
  const { siteConfig, updateSiteConfig } = useAdminStore()
  const { users, updateUser, user } = useAuthStore()
  const [form, setForm] = useState({ ...siteConfig })
  const [logoFile, setLogoFile] = useState(null)
  const [saved, setSaved] = useState(false)
  // Password change
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [showPw, setShowPw] = useState(false)

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(p => ({ ...p, logo: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    updateSiteConfig(form)
    setSaved(true)
    toast.success('Settings saved!')
    setTimeout(() => setSaved(false), 2000)
  }

  const handleChangePassword = () => {
    setPwError('')
    const currentStoredPw = localStorage.getItem('admin-pw') || 'admin123'
    if (pwForm.current !== currentStoredPw) {
      setPwError('Current password is incorrect')
      return
    }
    if (pwForm.newPw.length < 6) { setPwError('New password must be at least 6 characters'); return }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match'); return }
    localStorage.setItem('admin-pw', pwForm.newPw)
    // Also update in auth store so current session reflects new password
    updateUser({ id: 'admin', role: 'admin', password: pwForm.newPw })
    setPwForm({ current: '', newPw: '', confirm: '' })
    toast.success('Password changed successfully! Use the new password on next login.')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Site Settings</h2>
        <button onClick={handleSave} className="btn btn-primary">
          {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Settings</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
        {/* Branding */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>🎨 Branding</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Store Logo</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
              {form.logo && <img src={form.logo} style={{ height: 48, maxWidth: 160, objectFit: 'contain', border: '1px solid var(--border)', borderRadius: 8, padding: 4 }} />}
              <div>
                <input type="file" accept="image/png,image/svg+xml,image/jpg,image/jpeg" onChange={handleLogoUpload} style={{ display: 'none' }} id="logo-up" />
                <label htmlFor="logo-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--bg-secondary)', border: '1.5px dashed var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                  <Upload size={13} /> Upload Logo (PNG/SVG)
                </label>
              </div>
            </div>
            {form.logo && <button onClick={() => setForm(p => ({ ...p, logo: null }))} style={{ fontSize: 12, color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>Remove logo (use text)</button>}
          </div>
          <FormField label="Store Name" value={form.storeName} onChange={v => setForm(p => ({ ...p, storeName: v }))} />
          <FormField label="Tagline" value={form.tagline} onChange={v => setForm(p => ({ ...p, tagline: v }))} />
          <FormField label="Announcement Bar Text" value={form.announcement} onChange={v => setForm(p => ({ ...p, announcement: v }))} placeholder="e.g. Use code FIRST100" />
        </div>

        {/* Contact */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>📞 Contact Info</h3>
          <FormField label="Contact Email" value={form.contactEmail} onChange={v => setForm(p => ({ ...p, contactEmail: v }))} type="email" />
          <FormField label="Contact Phone" value={form.contactPhone} onChange={v => setForm(p => ({ ...p, contactPhone: v }))} />
          <FormField label="WhatsApp Number (with country code, no +)" value={form.whatsappNumber} onChange={v => setForm(p => ({ ...p, whatsappNumber: v }))} placeholder="919876543210" />
          <FormField label="Address" value={form.address} onChange={v => setForm(p => ({ ...p, address: v }))} />
        </div>

        {/* Social */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>🌐 Social Media</h3>
          {[
            { key: 'instagram', label: 'Instagram URL' },
            { key: 'facebook', label: 'Facebook URL' },
            { key: 'youtube', label: 'YouTube URL' },
          ].map(s => (
            <FormField key={s.key} label={s.label} value={form.social?.[s.key] || ''} onChange={v => setForm(p => ({ ...p, social: { ...p.social, [s.key]: v } }))} placeholder="https://..." />
          ))}
        </div>

        {/* Notification (free) */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 15 }}>🔔 Order Notifications (Free)</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
            WhatsApp: completely free — opens WhatsApp with order details.<br />
            Email: uses free <strong>EmailJS</strong> (200 emails/month free).
          </p>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.notifyWhatsapp !== false} onChange={e => setForm(p => ({ ...p, notifyWhatsapp: e.target.checked }))} />
            Notify via WhatsApp (free)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.notifyEmail === true} onChange={e => setForm(p => ({ ...p, notifyEmail: e.target.checked }))} />
            Notify via Email (EmailJS - free tier)
          </label>
          {form.notifyEmail && (
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                Sign up free at <a href="https://emailjs.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>emailjs.com</a> → get Service ID, Template ID, Public Key
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
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Default: admin123 — change this immediately after first login.</p>
          {[
            { key: 'current', label: 'Current Password' },
            { key: 'newPw', label: 'New Password (min 6 chars)' },
            { key: 'confirm', label: 'Confirm New Password' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label style={labelStyle}>{f.label}</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))} style={inputStyle} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
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
      </div>
    </div>
  )
}

// ── Shared helpers ───────────────────────────────────────────
const labelStyle = { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5, color: 'var(--text)' }
const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#fff' }

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

