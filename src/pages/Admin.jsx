import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getAdminReservations,
  getAdminOrders,
  updateAdminReservation,
  updateAdminOrder,
} from '../api.js'
import { formatNaira } from '../utils/format.js'
import './Admin.css'

function fmt(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? String(iso) : d.toLocaleString()
}

const RES_STATUSES = ['Confirmed', 'Seated', 'Cancelled', 'Completed']
const ORDER_STATUSES = ['Received', 'Preparing', 'Out for delivery', 'Delivered', 'Cancelled']

export default function Admin() {
  const { user, isAdmin } = useAuth()
  const [tab, setTab] = useState('reservations')
  const [resvs, setResvs] = useState([])
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')

  useEffect(() => {
    if (!isAdmin) return
    setError('')
    getAdminReservations()
      .then(setResvs)
      .catch((e) => setError(e.message))
    getAdminOrders()
      .then(setOrders)
      .catch((e) => setError(e.message))
  }, [isAdmin])

  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin)
    return (
      <div className="container admin-wrap">
        <h1>Admins only</h1>
        <p>You don't have permission to view this page.</p>
        <Link to="/" className="btn">Back home</Link>
      </div>
    )

  const changeResv = async (id, status) => {
    setBusy(id)
    try {
      const r = await updateAdminReservation(id, status)
      setResvs((rows) => rows.map((x) => (x.id === id ? r : x)))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy('')
    }
  }

  const changeOrder = async (id, status) => {
    setBusy(id)
    try {
      const r = await updateAdminOrder(id, status)
      setOrders((rows) => rows.map((x) => (x.id === id ? r : x)))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="container admin-wrap">
      <h1>Admin Dashboard</h1>
      <p className="admin-sub">All reservations and orders across customers.</p>
      {error && <p className="form-error">{error}</p>}

      <div className="admin-tabs">
        <button
          className={tab === 'reservations' ? 'admin-tab active' : 'admin-tab'}
          onClick={() => setTab('reservations')}
        >
          Reservations ({resvs.length})
        </button>
        <button
          className={tab === 'orders' ? 'admin-tab active' : 'admin-tab'}
          onClick={() => setTab('orders')}
        >
          Orders ({orders.length})
        </button>
      </div>

      {tab === 'reservations' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Name</th>
                <th>Email</th>
                <th>Date/Time</th>
                <th>Guests</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {resvs.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>
                    {r.date} {r.time}
                  </td>
                  <td>{r.guests}</td>
                  <td>{r.status}</td>
                  <td>
                    <select
                      value={r.status}
                      disabled={busy === r.id}
                      onChange={(e) => changeResv(r.id, e.target.value)}
                    >
                      {RES_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {resvs.length === 0 && (
                <tr>
                  <td colSpan="7" className="admin-empty">No reservations yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'orders' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Fulfilment</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items
                const total =
                  typeof o.total === 'string' ? Number(o.total) : o.total
                return (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.customer?.name || '-'}</td>
                    <td>
                      {items
                        .map((i) => `${i.name} x${i.quantity}`)
                        .join(', ')}
                    </td>
                    <td>{formatNaira(total)}</td>
                    <td>{o.fulfillment}</td>
                    <td>{o.status}</td>
                    <td>
                      <select
                        value={o.status}
                        disabled={busy === o.id}
                        onChange={(e) => changeOrder(o.id, e.target.value)}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="admin-empty">No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
