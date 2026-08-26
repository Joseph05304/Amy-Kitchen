import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { formatNaira } from '../utils/format.js'
import './Bookings.css'

function statusClass(status) {
  const s = (status || '').toLowerCase().replace(/[^a-z]/g, '')
  if (['confirmed', 'received'].includes(s)) return 'tag tag--confirmed'
  if (['seated', 'preparing'].includes(s)) return 'tag tag--seated'
  if (['outfordelivery', 'delivered'].includes(s)) return 'tag tag--out'
  if (s === 'completed') return 'tag tag--completed'
  if (s === 'cancelled') return 'tag tag--cancelled'
  return 'tag'
}

function fmt(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export default function Bookings() {
  const { reservations, orders } = useCart()

  return (
    <div className="section container bookings-page">
      <h2 className="section-title">My Bookings</h2>
      <p className="section-subtitle">
        Everything you’ve reserved or ordered in this browser.
      </p>

      <section className="bookings-section">
        <h3>📅 Reservations ({reservations.length})</h3>
        {reservations.length === 0 ? (
          <div className="empty-note">
            No reservations yet.{' '}
            <Link to="/reservations">Book a table →</Link>
          </div>
        ) : (
          <div className="grid bookings-grid">
            {reservations.map((r) => (
              <div key={r.id} className="card booking-card">
                <div className="booking-top">
                  <span className="booking-id">{r.id}</span>
                  <span className={statusClass(r.status)}>{r.status}</span>
                </div>
                <p>
                  <strong>{r.name}</strong> · {r.guests} guests
                </p>
                <p className="booking-meta">
                  📅 {r.date} at {r.time}
                </p>
                <p className="booking-meta">📍 {r.seating}</p>
                {r.requests && (
                  <p className="booking-meta">📝 {r.requests}</p>
                )}
                <p className="booking-meta">🕒 Booked {fmt(r.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bookings-section">
        <h3>🧾 Orders ({orders.length})</h3>
        {orders.length === 0 ? (
          <div className="empty-note">
            No orders yet. <Link to="/menu">Start an order →</Link>
          </div>
        ) : (
          <div className="grid bookings-grid">
            {orders.map((o) => (
              <div key={o.id} className="card booking-card">
                <div className="booking-top">
                  <span className="booking-id">{o.id}</span>
                  <span className={statusClass(o.status)}>{o.status}</span>
                </div>
                <p>
                  <strong>{o.customer.name}</strong> · {o.customer.fulfillment}
                </p>
                <ul className="order-items">
                  {o.items.map((i) => (
                    <li key={i.id}>
                      {i.quantity}× {i.name}
                    </li>
                  ))}
                </ul>
                <p className="booking-meta">💰 Total {formatNaira(o.total)}</p>
                <p className="booking-meta">🕒 {fmt(o.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
