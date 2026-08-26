import { Link, useLocation } from 'react-router-dom'
import { formatNaira } from '../utils/format.js'

export default function Confirmation() {
  const location = useLocation()
  const order = location.state?.order

  if (!order) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>No recent order found</h2>
        <p>Browse the menu and place an order to see confirmation here.</p>
        <Link to="/menu" className="btn">
          Go to menu
        </Link>
      </div>
    )
  }

  return (
    <div
      className="section container"
      style={{ minHeight: '70vh', display: 'flex', justifyContent: 'center' }}
    >
      <div className="card" style={{ maxWidth: 520, padding: 36, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>✅</div>
        <h2>Order confirmed!</h2>
        <p>
          Thanks {order.customer.name}. Your order{' '}
          <strong>{order.id}</strong> is <strong>{order.status}</strong>.
        </p>
        <div
          style={{
            textAlign: 'left',
            background: 'var(--surface-2)',
            borderRadius: 12,
            padding: 16,
            margin: '18px 0',
          }}
        >
          {order.items.map((i) => (
            <div
              key={i.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 0',
              }}
            >
              <span>
                {i.quantity}× {i.name}
              </span>
              <span>{formatNaira(i.price * i.quantity)}</span>
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 800,
              borderTop: '1px solid var(--border)',
              marginTop: 8,
              paddingTop: 8,
            }}
          >
            <span>Total</span>
            <span>{formatNaira(order.total)}</span>
          </div>
          <p style={{ margin: '10px 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
            Fulfillment: {order.customer.fulfillment}
            {order.customer.fulfillment === 'delivery' &&
              ` — ${order.customer.address}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/menu" className="btn">
            Order more
          </Link>
          <Link to="/bookings" className="btn btn-secondary">
            My bookings & orders
          </Link>
        </div>
      </div>
    </div>
  )
}
