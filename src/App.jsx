import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import Cart from './Cart'
import './App.css'

const API_URL = 'https://dummyjson.com/products'
const CATEGORIES = ['beauty', 'fragrances', 'furniture', 'groceries']
const CART_STORAGE_KEY = 'tienda-cart'
const CART_OPEN_STORAGE_KEY = 'tienda-cart-open'
const PRODUCTS_STORAGE_KEY = 'tienda-products'

function readStorageValue(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const rawValue = window.localStorage.getItem(key)
    return rawValue ? JSON.parse(rawValue) : fallback
  } catch {
    return fallback
  }
}

function normalizeCart(items) {
  if (!Array.isArray(items)) {
    return []
  }

  const mergedItems = new Map()

  items.forEach((item) => {
    if (!item || !item.id) {
      return
    }

    const quantity = Number(item.quantity) || 1

    if (mergedItems.has(item.id)) {
      const currentItem = mergedItems.get(item.id)
      currentItem.quantity += quantity
      return
    }

    mergedItems.set(item.id, { ...item, quantity })
  })

  return [...mergedItems.values()].filter((item) => item.quantity > 0)
}

function getDiscountedPrice(product) {
  const basePrice = Number(product.price) || 0
  const discount = Number(product.discountPercentage) || 0
  return basePrice * (1 - discount / 100)
}

function App() {
  const [products, setProducts] = useState(() => readStorageValue(PRODUCTS_STORAGE_KEY, []))
  const [cart, setCart] = useState(() => normalizeCart(readStorageValue(CART_STORAGE_KEY, [])))
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showCart, setShowCart] = useState(() => readStorageValue(CART_OPEN_STORAGE_KEY, false))

  const cartQuantityByProduct = cart.reduce((acc, item) => {
    acc[item.id] = (acc[item.id] || 0) + item.quantity
    return acc
  }, {})

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch {
      // ignore localStorage write errors
    }
  }, [cart])

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_OPEN_STORAGE_KEY, JSON.stringify(showCart))
    } catch {
      // ignore localStorage write errors
    }
  }, [showCart])

  useEffect(() => {
    setLoading(true)
    const trimmedSearch = search.trim()
    const url = trimmedSearch
      ? `${API_URL}/search?q=${encodeURIComponent(trimmedSearch)}`
      : `${API_URL}?limit=30`

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error fetching products')
        }
        return res.json()
      })
      .then((data) => {
        const apiProducts = Array.isArray(data.products) ? data.products : []
        setProducts((currentProducts) => {
          if (currentProducts.length === 0) {
            return apiProducts
          }

          const map = new Map(currentProducts.map((product) => [product.id, product]))
          apiProducts.forEach((product) => {
            if (map.has(product.id)) {
              map.set(product.id, { ...product, stock: map.get(product.id).stock })
            } else {
              map.set(product.id, product)
            }
          })

          return [...map.values()]
        })
      })
      .catch(() => {
        setProducts((currentProducts) => currentProducts)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [search])

  useEffect(() => {
    try {
      window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products))
    } catch {
      // ignore localStorage write errors
    }
  }, [products])

  function addToCart(product) {
    const availableStock = Math.max((Number(product.stock) || 0) - (cartQuantityByProduct[product.id] || 0), 0)

    if (availableStock <= 0) {
      return
    }

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id)

      if (existingItem) {
        const totalRequested = existingItem.quantity + 1
        const productStock = Number(product.stock) || 0

        if (totalRequested > productStock) {
          return currentCart
        }

        return currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: totalRequested } : item
        )
      }

      return [...currentCart, { ...product, quantity: 1 }]
    })
  }

  function changeQty(index, delta) {
    setCart((currentCart) =>
      currentCart.flatMap((item, i) => {
        if (i !== index) {
          return [item]
        }

        const product = products.find((entry) => entry.id === item.id)
        const productStock = Number(product?.stock || item.stock || 0)
        const nextQty = item.quantity + delta

        if (delta > 0 && nextQty > productStock) {
          return [item]
        }

        if (nextQty <= 0) {
          return []
        }

        return [{ ...item, quantity: nextQty }]
      })
    )
  }

  function removeFromCart(productId) {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId))
  }

  function checkout() {
    if (cart.length === 0) {
      return
    }

    const confirmed = window.confirm(`Confirmar compra por un total de $${total.toFixed(2)}?`)
    if (!confirmed) {
      return
    }

    setProducts((currentProducts) =>
      currentProducts.map((product) => {
        const cartItem = cart.find((item) => item.id === product.id)
        if (!cartItem) {
          return product
        }

        return {
          ...product,
          stock: Math.max((Number(product.stock) || 0) - cartItem.quantity, 0),
        }
      })
    )

    setCart([])
    alert(`Compra realizada. Total: $${total.toFixed(2)}`)
  }

  const total = cart.reduce(
    (sum, item) => sum + getDiscountedPrice(item) * item.quantity,
    0
  )

  const normalizedSearch = search.trim().toLowerCase()
  const visibleProducts = products
    .filter((product) => category === 'all' || product.category === category)
    .filter((product) => product.title.toLowerCase().includes(normalizedSearch))

  return (
    <div className="app">
      <header className="header">
        <h1>Tienda Tech</h1>
        <input
          className="search"
          type="search"
          aria-label="Buscar productos"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Filtrar por categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Todas</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button className="cart-btn" onClick={() => setShowCart(!showCart)}>
          Carrito ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </header>

      <main>
        {loading && <p className="loading">Cargando...</p>}

        {!loading && visibleProducts.length === 0 && <p>Sin resultados.</p>}

        <div className="grid">
          {visibleProducts.map((product) => {
            const availableStock = Math.max((Number(product.stock) || 0) - (cartQuantityByProduct[product.id] || 0), 0)

            return (
              <ProductCard
                key={product.id}
                product={product}
                availableStock={availableStock}
                onAdd={() => addToCart(product)}
              />
            )
          })}
        </div>
      </main>

      {showCart && (
        <Cart
          items={cart}
          total={total}
          onQty={changeQty}
          onRemove={removeFromCart}
          onCheckout={checkout}
          onClose={() => setShowCart(false)}
        />
      )}
    </div>
  )
}

export default App
