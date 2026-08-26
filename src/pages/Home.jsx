import { Link } from 'react-router-dom'
import { MENU } from '../data/menu.js'
import { formatNaira } from '../utils/format.js'
import './Home.css'

export default function Home() {
  const featured = MENU.filter((m) => ['rc1', 'sw1', 'gr1', 'de2'].includes(m.id))

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <span className="hero-badge">🍲 Now serving · Order online</span>
            <h1>
              Taste of
              <br /> home, delivered.
            </h1>
            <p>
              From smoky party jollof to spicy suya — reserve a table or order
              your favourite African delicacies for pickup and delivery.
            </p>
            <div className="hero-actions">
              <Link to="/menu" className="btn">
                Order food
              </Link>
              <Link to="/reservations" className="btn btn-outline">
                Book a table
              </Link>
            </div>
            <div className="hero-stats">
              <div>
                <strong>4.9★</strong>
                <span>2k+ reviews</span>
              </div>
              <div>
                <strong>20+</strong>
                <span>Dishes</span>
              </div>
              <div>
                <strong>20 min</strong>
                <span>Avg. prep</span>
              </div>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <span className="hero-emoji">🍲</span>
            <span className="hero-emoji float-2">🍢</span>
            <span className="hero-emoji float-3">🍚</span>
          </div>
        </div>
      </section>

      <section className="section container">
        <h2 className="section-title">Customer favourites</h2>
        <p className="section-subtitle">
          Hand-picked dishes our guests keep coming back for.
        </p>
        <div className="grid featured-grid">
          {featured.map((item) => (
            <article key={item.id} className="card featured-card">
              <div className="featured-emoji">{item.emoji}</div>
              <div>
                <h3>{item.name}</h3>
                <p className="featured-desc">{item.description}</p>
                <div className="featured-foot">
                  <span className="menu-price">{formatNaira(item.price)}</span>
                  <Link to="/menu" className="btn btn-secondary">
                    Order now
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section container how">
        <h2 className="section-title">How it works</h2>
        <div className="grid how-grid">
          <div className="card how-card">
            <div className="how-num">1</div>
            <h3>Browse the menu</h3>
            <p>Explore dishes by category and add your favourites to the cart.</p>
          </div>
          <div className="card how-card">
            <div className="how-num">2</div>
            <h3>Reserve or order</h3>
            <p>Book a table in seconds, or checkout online for pickup.</p>
          </div>
          <div className="card how-card">
            <div className="how-num">3</div>
            <h3>Enjoy</h3>
            <p>Dine with us or relax at home with fresh, hot food.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta-inner">
          <h2>Hungry already?</h2>
          <p>Start your order or save a seat for tonight.</p>
          <div className="hero-actions">
            <Link to="/menu" className="btn">
              See the menu
            </Link>
            <Link to="/reservations" className="btn btn-secondary">
              Reserve a table
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
