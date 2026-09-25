import { getDiscountedPrice } from './pricing'

function ProductCard({ product, availableStock, inCart, onAdd }) {
  const isOutOfStock = availableStock <= 0
  const price = Number(product.price) || 0
  const finalPrice = getDiscountedPrice(product)
  const hasDiscount = finalPrice < price

  return (
    <article className="card">
      <img src={product.thumbnail} alt={product.title} loading="lazy" />
      <h3>{product.title}</h3>
      <p className="price">
        ${finalPrice.toFixed(2)}
        {hasDiscount && (
          <>
            {' '}
            <s className="price-old">${price.toFixed(2)}</s>
            <span className="discount"> -{Math.round(product.discountPercentage)}%</span>
          </>
        )}
      </p>
      <p className="meta">
        Rating: {(Number(product.rating) || 0).toFixed(1)} · Disponibles: {availableStock}
        {inCart > 0 && <> · En carrito: {inCart}</>}
      </p>
      <button className="add-btn" onClick={onAdd} disabled={isOutOfStock}>
        {isOutOfStock ? (inCart > 0 ? 'Máximo en carrito' : 'Sin stock') : 'Agregar'}
      </button>
    </article>
  )
}

export default ProductCard
