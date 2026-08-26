import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div
      className="section container"
      style={{ textAlign: 'center', padding: '90px 20px', minHeight: '60vh' }}
    >
      <div style={{ fontSize: '3.5rem' }}>🍽️</div>
      <h2>Page not found</h2>
      <p>The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="btn">
        Back home
      </Link>
    </div>
  )
}
