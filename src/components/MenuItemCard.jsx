import { useCart } from '../context/CartContext.jsx'
import { formatNaira } from '../utils/format.js'

export default function MenuItemCard({ item }) {
  const { addToCart } = useCart()

  return (
    <article className="menu-card card">
      <div className="menu-emoji" aria-hidden="true">
        {item.emoji}
      </div>
      <div className="menu-body">
        <div className="menu-head">
          <h3 className="menu-name">{item.name}</h3>
          <span className="menu-price">{formatNaira(item.price)}</span>
        </div>
        <p className="menu-desc">{item.description}</p>
        {item.tags?.length > 0 && (
          <div className="menu-tags">
            {item.tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        )}
        <button
          className="btn menu-add"
          onClick={() => addToCart(item, 1)}
          aria-label={`Add ${item.name} to cart`}
        >
          Add to cart
        </button>
      </div>
    </article>
  )
}
