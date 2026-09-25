import { useState } from 'react'
import { getDiscountedPrice } from './pricing'

function Cart({ items, total, getStock, onQty, onRemove, onCheckout, onClose }) {
  const [pendingRemoveId, setPendingRemoveId] = useState(null)

  return (
    <aside className="cart" aria-label="Carrito de compras">
      <div className="cart-header">
        <h2>Tu carrito</h2>
        <button className="cart-close" aria-label="Cerrar carrito" title="Cerrar (Esc)" onClick={onClose}>
          ×
        </button>
      </div>

      {items.length === 0 && <p>El carrito está vacío.</p>}

      <ul className="cart-list">
        {items.map((item) => {
          const maxQty = getStock(item)
          const atMax = item.quantity >= maxQty

          return (
            <li key={item.id} className="cart-item">
              <img src={item.thumbnail} alt="" width="60" />
              <div className="cart-details">
                <span className="cart-title">{item.title}</span>
                <span className="cart-price">
                  ${getDiscountedPrice(item).toFixed(2)} c/u · Subtotal ${(getDiscountedPrice(item) * item.quantity).toFixed(2)}
                </span>
                {atMax && <span className="cart-limit">Máximo disponible</span>}
              </div>
              <div className="qty">
                <button
                  aria-label={`Quitar una unidad de ${item.title}`}
                  onClick={() => onQty(item.id, -1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span aria-live="polite">{item.quantity}</span>
                <button
                  aria-label={`Agregar una unidad de ${item.title}`}
                  onClick={() => onQty(item.id, 1)}
                  disabled={atMax}
                >
                  +
                </button>
              </div>
              <button
                className="remove"
                aria-label={`Eliminar ${item.title}`}
                title="Eliminar del carrito"
                onClick={() => setPendingRemoveId(item.id)}
              >
                x
              </button>
              {pendingRemoveId === item.id && (
                <div
                  className="remove-confirm"
                  role="alertdialog"
                  aria-label={`Confirmar eliminación de ${item.title}`}
                  onKeyDown={(e) => {
                    // Esc cancela solo la confirmación, no cierra el carrito
                    if (e.key === 'Escape') {
                      e.stopPropagation()
                      setPendingRemoveId(null)
                    }
                  }}
                >
                  <span>¿Eliminar este producto del carrito?</span>
                  <div className="remove-confirm-actions">
                    <button onClick={() => setPendingRemoveId(null)} autoFocus>
                      Cancelar
                    </button>
                    <button
                      className="danger"
                      onClick={() => {
                        onRemove(item.id)
                        setPendingRemoveId(null)
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <div className="cart-footer">
        <h3>Total: ${total.toFixed(2)}</h3>
        <button className="pay-btn" onClick={onCheckout} disabled={items.length === 0}>
          Pagar
        </button>
      </div>
    </aside>
  )
}

export default Cart
