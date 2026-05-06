import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Categories from './pages/Categories'
import CategoryPage from './pages/CategoryPage'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import SearchResults from './pages/SearchResults'
import AboutUs from './pages/AboutUs'
import AdminPanel from './pages/Admin'
import { ContactPage, OrdersPage, TermsPage, PrivacyPage, RefundPage, ShippingPage } from './pages/OtherPages'
import ResetPassword from './pages/ResetPassword'
import { useAuthStore, useAdminStore } from './store'

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }) }, [pathname])
  return null
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, user } = useAuthStore()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function Layout({ children, noFooter = false }) {
  return (
    <>
      <Header />
      <main style={{ minHeight: '70vh' }}>{children}</main>
      {!noFooter && <Footer />}
    </>
  )
}

export default function App() {
  // Use a selector so App only re-renders when syncFromBackend itself changes
  // (it never does — Zustand actions are stable), preventing cascade re-renders
  // every time syncFromBackend resolves and updates products/orders/carts.
  const syncFromBackend = useAdminStore(state => state.syncFromBackend)

  useEffect(() => {
    syncFromBackend()
  }, [])

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-right" toastOptions={{ className: 'hot-toast', duration: 3000 }} />
      <Routes>
        <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />

        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Layout noFooter><Auth /></Layout>} />
        <Route path="/forgot-password" element={<Layout noFooter><ResetPassword /></Layout>} />
        <Route path="/reset-password" element={<Layout noFooter><ResetPassword /></Layout>} />
        {/* Bug #1: Registration removed — redirect to login */}
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/categories" element={<Layout><Categories /></Layout>} />
        <Route path="/category/:slug" element={<Layout><CategoryPage /></Layout>} />
        <Route path="/product/:slug" element={<Layout><ProductDetail /></Layout>} />
        <Route path="/search" element={<Layout><SearchResults /></Layout>} />
        <Route path="/about" element={<Layout><AboutUs /></Layout>} />
        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
        <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
        <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
        <Route path="/refund" element={<Layout><RefundPage /></Layout>} />
        <Route path="/shipping" element={<Layout><ShippingPage /></Layout>} />

        <Route path="/cart" element={<Layout><ProtectedRoute><Cart /></ProtectedRoute></Layout>} />
        <Route path="/orders" element={<Layout><ProtectedRoute><OrdersPage /></ProtectedRoute></Layout>} />

        <Route path="*" element={
          <Layout>
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: 72, marginBottom: 16 }}>404</div>
              <h2 style={{ marginBottom: 8 }}>Page not found</h2>
              <a href="/" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 16 }}>Go Home</a>
            </div>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  )
}
