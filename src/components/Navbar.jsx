import { useState } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import './Navbar.css'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/reservations', label: 'Reservations' },
  { to: '/bookings', label: 'My Bookings' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { cartCount } = useCart()
  const { user, isAdmin, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const close = () => setOpen(false)

  const handleLogout = () => {
    logout()
    close()
    navigate('/')
  }

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">🍲</span>
          <span className="brand-name">AMY'S KITCHEN</span>
        </Link>

        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={open ? 'bar open' : 'bar'} />
          <span className={open ? 'bar open' : 'bar'} />
          <span className={open ? 'bar open' : 'bar'} />
        </button>

        <nav className={open ? 'nav-links open' : 'nav-links'}>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                isActive || (l.to !== '/' && location.pathname.startsWith(l.to))
                  ? 'nav-link active'
                  : 'nav-link'
              }
              onClick={close}
            >
              {l.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
              onClick={close}
            >
              Admin
            </NavLink>
          )}
          <Link
            to="/cart"
            className="cart-btn"
            onClick={close}
            aria-label="View cart"
          >
            🛒
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
          {user ? (
            <>
              <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
              <button className="nav-link nav-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
                onClick={close}
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
                onClick={close}
              >
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
