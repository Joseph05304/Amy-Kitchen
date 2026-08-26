import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { formatNaira } from '../utils/format.js'
import './Cart.css'

const DELIVERY_FEE = 1500

export default function Cart() {
  const {
    cart,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
  } = useCart()
  const navigate = useNavigate()

  const [fulfillment, setFulfillment] = useState('pickup')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
  })
  const [errors, setErrors] = useState({})

  const delivery = fulfillment === 'delivery'
  const total = cartTotal + (delivery && cart.length ? DELIVERY_FEE : 0)

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (!/^[0-9+()\-\s]{7,}$/.test(form.phone))
      e.phone = 'Enter a valid phone number.'
    if (delivery && !form.address.trim()) e.address = 'Address is required.'
    return e
  }

  const handleCheckout = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }
    const order = await placeOrder({
      ...form,
      fulfillment,
      deliveryFee: delivery ? DELIVERY_FEE : 0,
    })
    navigate('/confirmation', { state: { order } })
  }

  if (cart.length === 0) {
    return (
      <div className="section container cart-empty">
        <div className="cart-empty-emoji">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Browse the menu and add something delicious.</p>
        <Link to="/menu" className="btn">
          Explore the menu
        </Link>
      </div>
    )
  }

  return (
    <div className="section container cart-page">
      <h2 className="section-title">Your Order</h2>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.id} className="card cart-item">
            <div className="cart-emoji" aria-hidden="true">
              {item.emoji}
            </div>
              <div className="cart-info">
                <h4>{item.name}</h4>
                <span className="menu-price">{formatNaira(item.price)}</span>
              </div>
              <div className="qty">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <div className="cart-line">
                {formatNaira(item.price * item.quantity)}
              </div>
              <button
                className="cart-remove"
                onClick={() => removeFromCart(item.id)}
                aria-label={`Remove ${item.name}`}
              >
                ✕
              </button>
            </div>
          ))}
          <button className="btn btn-secondary cart-clear" onClick={clearCart}>
            Clear cart
          </button>
        </div>

        <aside className="card cart-summary">
          <h3>Order summary</h3>

          <div className="fulfil">
            <button
              className={fulfillment === 'pickup' ? 'active' : ''}
              onClick={() => setFulfillment('pickup')}
            >
              🏃 Pickup
            </button>
            <button
              className={fulfillment === 'delivery' ? 'active' : ''}
              onClick={() => setFulfillment('delivery')}
            >
              🛵 Delivery
            </button>
          </div>

          <div className="summary-lines">
            <div>
              <span>Subtotal</span>
              <span>{formatNaira(cartTotal)}</span>
            </div>
            {delivery && (
              <div>
                <span>Delivery fee</span>
                <span>{formatNaira(DELIVERY_FEE)}</span>
              </div>
            )}
            <div className="summary-total">
              <span>Total</span>
              <span>{formatNaira(total)}</span>
            </div>
          </div>

          <form className="checkout-form" onSubmit={handleCheckout} noValidate>
            <label htmlFor="cname">Name</label>
            <input
              id="cname"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Jane Doe"
            />
            {errors.name && <span className="err">{errors.name}</span>}

            <label htmlFor="cphone">Phone</label>
            <input
              id="cphone"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="(555) 012-3456"
            />
            {errors.phone && <span className="err">{errors.phone}</span>}

            {delivery && (
              <>
                <label htmlFor="caddr">Delivery address</label>
                <input
                  id="caddr"
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  placeholder="123 Flavour Street"
                />
                {errors.address && (
                  <span className="err">{errors.address}</span>
                )}
              </>
            )}

            <button type="submit" className="btn cart-checkout">
              Place order · {formatNaira(total)}
            </button>
          </form>
        </aside>
      </div>
    </div>
  )
}
