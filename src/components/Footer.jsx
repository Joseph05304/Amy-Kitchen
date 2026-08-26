import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">🍲 AMY'S KITCHEN</div>
          <p className="footer-text">
            Authentic Nigerian &amp; African home cooking. Dine in, reserve a
            table, or order your favourites for pickup and delivery.
          </p>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li>
              <Link to="/menu">Menu</Link>
            </li>
            <li>
              <Link to="/reservations">Reservations</Link>
            </li>
            <li>
              <Link to="/cart">Order Online</Link>
            </li>
            <li>
              <Link to="/bookings">My Bookings</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>Visit Us</h4>
          <ul>
            <li>12 Bourdillon Road, Ikoyi</li>
            <li>Lagos, Nigeria</li>
            <li>Tue–Sun · 11:00 – 22:00</li>
            <li>+234 801 234 5678</li>
          </ul>
        </div>
        <div>
          <h4>Follow</h4>
          <div className="footer-social">
            <span>📷</span>
            <span>📘</span>
            <span>🐦</span>
            <span>📍</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          © {new Date().getFullYear()} Amy's Kitchen. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
