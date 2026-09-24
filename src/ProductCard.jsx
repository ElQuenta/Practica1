function ProductCard({ product, availableStock, onAdd }) {
  const isOutOfStock = availableStock <= 0

  return (
    <article className="card">
      <img src={product.thumbnail} alt={product.title} />
      <h3>{product.title}</h3>
      <p className="price">${product.price.toFixed(2)}</p>
      <p className="meta">
        Rating: {product.rating.toFixed(1)} · Stock: {availableStock}
      </p>
      <button className="add-btn" onClick={onAdd} disabled={isOutOfStock}>
        {isOutOfStock ? 'Sin stock' : 'Agregar'}
      </button>
    </article>
  )
}

export default ProductCard
