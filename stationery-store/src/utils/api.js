// API utility — connects frontend to backend
// Set VITE_API_URL in .env.local (e.g. http://localhost:5000)
// Falls back to local Zustand state if backend unreachable

const API = import.meta.env.VITE_API_URL || ''

export const isApiEnabled = () => !!API

const req = async (method, path, body) => {
  if (!API) return null
  try {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }
    const res = await fetch(`${API}${path}`, opts)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn('API call failed (using local state):', e.message)
    return null
  }
}

export const api = {
  getProducts: () => req('GET', '/api/products'),
  addProduct:  (data) => req('POST', '/api/products', data),
  updateProduct: (id, data) => req('PUT', `/api/products/${id}`, data),
  deleteProduct: (id) => req('DELETE', `/api/products/${id}`),

  getOrders: () => req('GET', '/api/orders'),
  addOrder:  (data) => req('POST', '/api/orders', data),
  updateOrderStatus: (orderId, status) => req('PUT', `/api/orders/${orderId}/status`, { status }),

  getConfig: () => req('GET', '/api/config'),
  saveConfig: (data) => req('POST', '/api/config', data),
}
