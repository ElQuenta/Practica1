function Cart({ items, total, onQty, onRemove, onCheckout, onClose }) {
  return (
    <aside className="cart">
      <div className="cart-header">
        <h2>Tu carrito</h2>
        <button className="cart-close" aria-label="Cerrar carrito" onClick={onClose}>
          ×
        </button>
      </div>

      {items.length === 0 && <p>El carrito está vacío.</p>}

      <ul className="cart-list">
        {items.map((item, index) => (
          <li key={item.id} className="cart-item">
            <img src={item.thumbnail} alt={item.title} width="60" />
            <div className="cart-details">
              <span className="cart-title">{item.title}</span>
              <span className="cart-price">${(item.price * (1 - item.discountPercentage / 100)).toFixed(2)}</span>
            </div>
            <div className="qty">
              <button aria-label="Quitar uno" onClick={() => onQty(index, -1)}>
                -
              </button>
              <span>{item.quantity}</span>
              <button aria-label="Agregar uno" onClick={() => onQty(index, 1)}>
                +
              </button>
            </div>
            <button
              className="remove"
              aria-label={`Eliminar ${item.title}`}
              onClick={() => onRemove(item.id)}
            >
              x
            </button>
          </li>
        ))}
      </ul>

      <h3>Total: ${total.toFixed(2)}</h3>
      <button className="pay-btn" onClick={onCheckout} disabled={items.length === 0}>
        Pagar
      </button>
    </aside>
  )
}

export default Cart
