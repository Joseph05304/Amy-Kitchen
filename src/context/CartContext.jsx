import { createContext, useContext, useEffect, useState } from 'react'
import {
  createReservation,
  getReservation,
  createOrder,
  getOrder,
  getMyReservations,
  getMyOrders,
  getToken,
} from '../api.js'

const CartContext = createContext(null)

const CART_KEY = 'savory_cart'
const IDS_KEY = 'savory_my_ids'

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function normalizeReservation(r) {
  return { ...r, createdAt: r.created_at }
}

function normalizeOrder(o) {
  return {
    id: o.id,
    items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
    total: o.total,
    customer:
      typeof o.customer === 'string' ? JSON.parse(o.customer) : o.customer,
    fulfillment: o.fulfillment,
    deliveryFee: o.delivery_fee,
    status: o.status,
    createdAt: o.created_at,
  }
}

function persistId(type, id) {
  const ids = loadJSON(IDS_KEY, [])
  if (!ids.some((x) => x.type === type && x.id === id)) {
    ids.push({ type, id })
    localStorage.setItem(IDS_KEY, JSON.stringify(ids))
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => loadJSON(CART_KEY, []))
  const [orders, setOrders] = useState([])
  const [reservations, setReservations] = useState([])

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  const refreshBookings = async () => {
    if (getToken()) {
      try {
        const [res, ord] = await Promise.all([
          getMyReservations(),
          getMyOrders(),
        ])
        setReservations((res || []).map(normalizeReservation))
        setOrders((ord || []).map(normalizeOrder))
      } catch {
        /* ignore */
      }
      return
    }
    // Fallback: this browser's locally stored ids
    const ids = loadJSON(IDS_KEY, [])
    if (ids.length === 0) return
    const results = await Promise.all(
      ids.map(async ({ type, id }) => {
        try {
          if (type === 'reservation')
            return { type, data: normalizeReservation(await getReservation(id)) }
          return { type, data: normalizeOrder(await getOrder(id)) }
        } catch {
          return null
        }
      }),
    )
    const res = []
    const ord = []
    results.filter(Boolean).forEach(({ type, data }) => {
      if (type === 'reservation') res.push(data)
      else ord.push(data)
    })
    setReservations(res)
    setOrders(ord)
  }

  useEffect(() => {
    refreshBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addToCart = (item, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id)
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + quantity } : c,
        )
      }
      return [...prev, { ...item, quantity }]
    })
  }

  const updateQuantity = (id, quantity) => {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((c) => c.id !== id)
        : prev.map((c) => (c.id === id ? { ...c, quantity } : c)),
    )
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((c) => c.id !== id))
  }

  const clearCart = () => setCart([])

  const addReservation = async (form) => {
    const rec = await createReservation(form)
    const norm = normalizeReservation(rec)
    setReservations((prev) => [norm, ...prev])
    if (!getToken()) persistId('reservation', norm.id)
    return norm
  }

  const placeOrder = async (customer) => {
    const rec = await createOrder({
      items: cart,
      total: cart.reduce((sum, c) => sum + c.price * c.quantity, 0),
      customer,
    })
    const norm = normalizeOrder(rec)
    setOrders((prev) => [norm, ...prev])
    if (!getToken()) persistId('order', norm.id)
    clearCart()
    return norm
  }

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0)
  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        orders,
        placeOrder,
        reservations,
        addReservation,
        refreshBookings,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
