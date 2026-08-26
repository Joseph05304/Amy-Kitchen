const BASE = '/api'
const TOKEN_KEY = 'savory_token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function headers() {
  const h = { 'Content-Type': 'application/json' }
  const t = getToken()
  if (t) h.Authorization = `Bearer ${t}`
  return h
}

export async function register(data) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error(e.error || 'Registration failed')
  }
  return res.json()
}

export async function login(data) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error(e.error || 'Login failed')
  }
  return res.json()
}

export async function getMe() {
  const res = await fetch(`${BASE}/auth/me`, { headers: headers() })
  if (!res.ok) throw new Error('Not authenticated')
  return res.json()
}

export async function createReservation(data) {
  const res = await fetch(`${BASE}/reservations`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error(e.error || 'Failed to save reservation')
  }
  return res.json()
}

export async function getReservation(id) {
  const res = await fetch(`${BASE}/reservations/${encodeURIComponent(id)}`)
  if (!res.ok) throw new Error('Not found')
  return res.json()
}

export async function createOrder(data) {
  const res = await fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error(e.error || 'Failed to place order')
  }
  return res.json()
}

export async function getOrder(id) {
  const res = await fetch(`${BASE}/orders/${encodeURIComponent(id)}`)
  if (!res.ok) throw new Error('Not found')
  return res.json()
}

export async function getMyReservations() {
  const res = await fetch(`${BASE}/reservations/me`, { headers: headers() })
  if (!res.ok) throw new Error('Failed to load reservations')
  return res.json()
}

export async function getMyOrders() {
  const res = await fetch(`${BASE}/orders/me`, { headers: headers() })
  if (!res.ok) throw new Error('Failed to load orders')
  return res.json()
}

export async function requestPasswordReset(email) {
  const res = await fetch(`${BASE}/auth/request-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export async function resetPassword(token, password) {
  const res = await fetch(`${BASE}/auth/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Reset failed')
  return data
}

export async function getAdminReservations() {
  const res = await fetch(`${BASE}/admin/reservations`, { headers: headers() })
  if (!res.ok) throw new Error('Failed to load reservations')
  return res.json()
}

export async function getAdminOrders() {
  const res = await fetch(`${BASE}/admin/orders`, { headers: headers() })
  if (!res.ok) throw new Error('Failed to load orders')
  return res.json()
}

export async function updateAdminReservation(id, status) {
  const res = await fetch(`${BASE}/admin/reservations/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Update failed')
  return res.json()
}

export async function updateAdminOrder(id, status) {
  const res = await fetch(`${BASE}/admin/orders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Update failed')
  return res.json()
}
