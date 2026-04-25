import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PRODUCTS, CATEGORIES, BANNERS } from './data/products'
import { api } from './utils/api'

// ── Auth Store ──────────────────────────────────────────────
// Admin login + Customer signup (no password for customers)
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      users: [],
      isLoggedIn: false,

      login: (email, password) => {
        const storedPw = localStorage.getItem('admin-pw') || 'admin123'
        if (email === 'admin@store.com' && password === storedPw) {
          const adminUser = { id: 'admin', name: 'Admin', email, role: 'admin', password }
          set({ user: adminUser, isLoggedIn: true })
          return { success: true }
        }
        // Customer login by phone or email
        const customer = get().users.find(
          u => u.role === 'customer' && (u.email === email || u.phone === email)
        )
        if (customer) {
          set({ user: customer, isLoggedIn: true })
          return { success: true }
        }
        return { success: false, message: 'Invalid email or password' }
      },

      // Register a new customer (called from SignupPopup)
      addUser: async (userData) => {
        const newUser = {
          id: 'USER-' + Date.now(),
          role: 'customer',
          createdAt: new Date().toISOString(),
          ...userData,
        }
        set(s => ({ users: [...s.users, newUser], user: newUser, isLoggedIn: true }))
        // Sync to backend so Admin can see the new customer
        await api.addUser(newUser)
        return newUser
      },

      logout: () => set({ user: null, isLoggedIn: false }),

      updateUser: (data) => {
        const user = get().user
        if (data.role === 'admin' && data.password) {
          localStorage.setItem('admin-pw', data.password)
        }
        if (!data.id || data.id === user?.id) {
          set({ user: { ...user, ...data } })
        }
      },
    }),
    { name: 'auth-store' }
  )
)

// ── Cart Store ──────────────────────────────────────────────
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      promoDiscount: 0,
      promoType: null,

      addItem: (product, qty = 1) => {
        const items = get().items
        const existing = items.find(i => i.id === product.id)
        if (existing) {
          set({ items: items.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i) })
        } else {
          set({ items: [...items, { ...product, qty }] })
        }
        // Sync cart to backend if a registered user is active
        const authState = JSON.parse(localStorage.getItem('auth-store') || '{}')
        const userId = authState?.state?.user?.id
        if (userId && userId !== 'admin') {
          const newItems = get().items
          api.saveCart(userId, newItems).catch(() => {})
        }
      },

      removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),

      updateQty: (id, qty) => {
        if (qty < 1) { get().removeItem(id); return }
        set({ items: get().items.map(i => i.id === id ? { ...i, qty } : i) })
      },

      clearCart: () => set({ items: [], promoCode: null, promoDiscount: 0, promoType: null }),

      applyPromo: (code) => {
        const PROMOS = {
          'FIRST100': { type: 'percent', value: 10 },
          'SAVE50': { type: 'flat', value: 50 },
        }
        const promo = PROMOS[code.toUpperCase()]
        if (!promo) return { success: false, message: 'Invalid promo code' }
        set({ promoCode: code.toUpperCase(), promoDiscount: promo.value, promoType: promo.type })
        return { success: true }
      },

      getTotal: () => {
        const { items, promoDiscount, promoType } = get()
        const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
        let discount = 0
        if (promoType === 'percent') discount = Math.round(subtotal * promoDiscount / 100)
        if (promoType === 'flat') discount = Math.min(promoDiscount, subtotal)
        return { subtotal, discount, total: subtotal - discount }
      },

      itemCount: () => get().items.reduce((s, i) => s + i.qty, 0),
    }),
    { name: 'cart-store' }
  )
)

// ── Admin Store ─────────────────────────────────────────────
// Bug #3 Fix: All mutating actions also call the backend API so changes
// are stored in MongoDB and visible on ALL browsers/devices.
export const useAdminStore = create(
  persist(
    (set, get) => ({
      products: PRODUCTS,
      categories: CATEGORIES,
      banners: BANNERS,
      orders: [],
      activeCarts: [],   // active user carts synced from backend
      siteConfig: {
        logo: null,
        storeName: 'Crifts',
        tagline: 'Return gifts, fancy stationery & hampers',
        announcement: 'Use code FIRST100 on first purchase',
        aboutUs: 'We are a leading stationery and gift store offering premium quality products at affordable prices.',
        aboutHeroTitle: 'About Us',
        aboutHeroSubtitle: 'Your trusted partner for stationery, gifts and more',
        aboutStoryTitle: 'Our Story',
        aboutMission: '',
        aboutVision: '',
        contactEmail: 'contact@mystore.com',
        contactPhone: '+91 98765 43210',
        whatsappNumber: '919876543210',
        address: 'Delhi, India',
        social: { instagram: '', facebook: '', youtube: '' },
        emailjsServiceId: '',
        emailjsTemplateId: '',
        emailjsPublicKey: '',
        notifyWhatsapp: true,
        notifyEmail: false,
        showHeroBanner: true,
        showAdminSection: true,
        bannerButtonText: 'Shop Now',
        teamMembers: [],
        paymentQrCode: null,   // Bug #8 — QR code for order popup
        termsContent: 'By using our website, you agree to these terms and conditions. All products are subject to availability.',
        privacyContent: 'We collect your name, email, phone and address only to process your orders. We do not share your data with third parties.',
        refundContent: 'Returns accepted within 7 days of delivery for damaged or incorrect items. Refunds processed within 5-7 business days.',
        shippingContent: 'We ship across India. Standard delivery 5-7 business days. Free shipping on all orders.',
        aboutStats: [
          { icon: '🛍️', number: '10,000+', label: 'Happy Customers' },
          { icon: '📦', number: '500+', label: 'Products' },
          { icon: '🏆', number: '5+ Years', label: 'Experience' },
          { icon: '⭐', number: '4.8/5', label: 'Average Rating' },
        ],
      },

      // Fetch all data from backend (call on app startup if API configured)
      syncFromBackend: async () => {
        const [products, orders, config, carts] = await Promise.all([
          api.getProducts(),
          api.getOrders(),
          api.getConfig(),
          api.getCarts(),
        ])
        const update = {}
        if (products?.length) update.products = products
        // Normalize: backend orders use `orderId`, frontend uses `id`
        if (orders?.length) update.orders = orders.map(o => ({ ...o, id: o.id || o.orderId }))
        if (config && Object.keys(config).length) update.siteConfig = { ...get().siteConfig, ...config }
        if (carts?.length) update.activeCarts = carts
        if (Object.keys(update).length) set(update)
      },

      updateSiteConfig: async (data) => {
        set(s => ({ siteConfig: { ...s.siteConfig, ...data } }))
        // Persist to backend so all browsers see the change (Bug #3)
        await api.saveConfig(data)
      },

      addProduct: async (product) => {
        const p = {
          ...product,
          id: 'P-' + Date.now(),
          slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          images: product.image ? [product.image] : [],
        }
        set(s => ({ products: [p, ...s.products] }))
        await api.addProduct(p)   // sync to backend (Bug #3)
      },

      updateProduct: async (id, data) => {
        set(s => ({ products: s.products.map(p => p.id === id ? { ...p, ...data } : p) }))
        await api.updateProduct(id, data)  // sync to backend (Bug #3)
      },

      deleteProduct: async (id) => {
        set(s => ({ products: s.products.filter(p => p.id !== id) }))
        await api.deleteProduct(id)   // sync to backend (Bug #3)
      },

      addCategory: (cat) => {
        const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        set(s => ({ categories: [{ ...cat, id: slug, slug }, ...s.categories] }))
      },
      updateCategory: (id, data) => set(s => ({ categories: s.categories.map(c => c.id === id ? { ...c, ...data } : c) })),
      deleteCategory: (id) => set(s => ({ categories: s.categories.filter(c => c.id !== id) })),

      addBanner: (banner) => set(s => ({ banners: [...s.banners, { ...banner, id: Date.now() }] })),
      updateBanner: (id, data) => set(s => ({ banners: s.banners.map(b => b.id === id ? { ...b, ...data } : b) })),
      deleteBanner: (id) => set(s => ({ banners: s.banners.filter(b => b.id !== id) })),

      addOrder: async (order) => {
        set(s => ({ orders: [order, ...s.orders] }))
        await api.addOrder(order)   // sync to backend so admin sees it (Bug #3)
      },

      updateOrderStatus: async (id, status) => {
        // Support both `id` and `orderId` field names (backend uses orderId)
        set(s => ({ orders: s.orders.map(o => (o.id === id || o.orderId === id) ? { ...o, status } : o) }))
        await api.updateOrderStatus(id, status)  // sync to backend
      },
    }),
    { name: 'admin-store' }
  )
)
