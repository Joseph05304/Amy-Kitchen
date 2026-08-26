import { useMemo, useState } from 'react'
import { MENU, CATEGORIES } from '../data/menu.js'
import MenuItemCard from '../components/MenuItemCard.jsx'
import './Menu.css'

export default function Menu() {
  const [active, setActive] = useState('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return MENU.filter((item) => {
      const matchCat = active === 'all' || item.category === active
      const matchQuery =
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      return matchCat && matchQuery
    })
  }, [active, query])

  return (
    <div className="section container menu-page">
      <h2 className="section-title">Our Menu</h2>
      <p className="section-subtitle">
        Fresh ingredients, bold flavours. Tap a dish to add it to your order.
      </p>

      <div className="menu-controls">
        <div className="menu-tabs">
          <button
            className={active === 'all' ? 'tab active' : 'tab'}
            onClick={() => setActive('all')}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={active === c.id ? 'tab active' : 'tab'}
              onClick={() => setActive(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <input
          className="menu-search"
          type="search"
          placeholder="Search dishes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search dishes"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid menu-grid">
          {filtered.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="menu-empty">No dishes match “{query}”.</p>
      )}
    </div>
  )
}
