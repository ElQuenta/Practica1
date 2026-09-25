import { useState, useEffect, useCallback } from 'react'
import ProductCard from './ProductCard'
import Cart from './Cart'
import { getDiscountedPrice } from './pricing'
import './App.css'

const API_URL = 'https://dummyjson.com/products'
const SEARCH_DEBOUNCE_MS = 300
const CART_STORAGE_KEY = 'tienda-cart'
const CART_OPEN_STORAGE_KEY = 'tienda-cart-open'
const PURCHASED_STORAGE_KEY = 'tienda-purchased'

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

function writeStorageValue(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore localStorage write errors
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

function formatCategory(value) {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ')
}

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState(() => normalizeCart(readStorageValue(CART_STORAGE_KEY, [])))
  const [purchased, setPurchased] = useState(() => readStorageValue(PURCHASED_STORAGE_KEY, {}))
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [showCart, setShowCart] = useState(() => readStorageValue(CART_OPEN_STORAGE_KEY, false))

  const cartQuantityByProduct = cart.reduce((acc, item) => {
    acc[item.id] = (acc[item.id] || 0) + item.quantity
    return acc
  }, {})

  // Stock real = stock de la API menos lo ya comprado en esta tienda
  const getStock = useCallback(
    (product) => Math.max((Number(product.stock) || 0) - (purchased[product.id] || 0), 0),
    [purchased]
  )

  useEffect(() => writeStorageValue(CART_STORAGE_KEY, cart), [cart])
  useEffect(() => writeStorageValue(CART_OPEN_STORAGE_KEY, showCart), [showCart])
  useEffect(() => writeStorageValue(PURCHASED_STORAGE_KEY, purchased), [purchased])

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timeoutId)
  }, [search])

  useEffect(() => {
    const controller = new AbortController()

    fetch(`${API_URL}/category-list`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {
        // si falla, el selector usa las categorías de los productos cargados
      })

    return () => controller.abort()
  }, [reloadKey])

  useEffect(() => {
    const controller = new AbortController()
    let url = `${API_URL}?limit=0`

    if (debouncedSearch) {
      url = `${API_URL}/search?q=${encodeURIComponent(debouncedSearch)}&limit=0`
    } else if (category !== 'all') {
      url = `${API_URL}/category/${encodeURIComponent(category)}?limit=0`
    }

    setLoading(true)
    setError(null)

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error fetching products')
        }
        return res.json()
      })
      .then((data) => {
        setProducts(Array.isArray(data.products) ? data.products : [])
        setLoading(false)
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          return
        }
        setError('No pudimos cargar los productos. Revisa tu conexión e inténtalo de nuevo.')
        setLoading(false)
      })

    return () => controller.abort()
  }, [debouncedSearch, category, reloadKey])

  useEffect(() => {
    if (!showCart) {
      return
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setShowCart(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showCart])

  function addToCart(product) {
    const productStock = getStock(product)

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id)
      const nextQty = (existingItem?.quantity || 0) + 1

      if (nextQty > productStock) {
        return currentCart
      }

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: nextQty } : item
        )
      }

      return [...currentCart, { ...product, quantity: 1 }]
    })
  }

  function changeQty(productId, delta) {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.id !== productId) {
          return item
        }

        const nextQty = item.quantity + delta

        if (nextQty < 1 || nextQty > getStock(item)) {
          return item
        }

        return { ...item, quantity: nextQty }
      })
    )
  }

  function removeFromCart(productId) {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId))
  }

  const total = cart.reduce(
    (sum, item) => sum + getDiscountedPrice(item) * item.quantity,
    0
  )

  function checkout() {
    if (cart.length === 0) {
      return
    }

    const confirmed = window.confirm(`¿Confirmar compra por un total de $${total.toFixed(2)}?`)
    if (!confirmed) {
      return
    }

    setPurchased((currentPurchased) => {
      const nextPurchased = { ...currentPurchased }
      cart.forEach((item) => {
        nextPurchased[item.id] = (nextPurchased[item.id] || 0) + item.quantity
      })
      return nextPurchased
    })

    setCart([])
    setShowCart(false)
    alert(`Compra realizada con éxito. Total pagado: $${total.toFixed(2)}`)
  }

  const categoryOptions = categories.length > 0
    ? categories
    : [...new Set(products.map((product) => product.category))].sort()
  const visibleProducts = products.filter(
    (product) => category === 'all' || product.category === category
  )
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="app">
      <header className="header">
        <h1>Bazar Central</h1>
        <input
          className="search"
          type="search"
          aria-label="Buscar productos"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Filtrar por categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Todas las categorías</option>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {formatCategory(c)}
            </option>
          ))}
        </select>
        <button
          className="cart-btn"
          aria-expanded={showCart}
          onClick={() => setShowCart(!showCart)}
        >
          Carrito ({cartCount})
        </button>
      </header>

      <main aria-busy={loading}>
        {loading && <p className="loading">Cargando...</p>}

        {error && (
          <div className="error" role="alert">
            <p>{error}</p>
            <button onClick={() => setReloadKey((key) => key + 1)}>Reintentar</button>
          </div>
        )}

        {!loading && !error && visibleProducts.length === 0 && (
          <div className="empty">
            <p>
              No encontramos productos
              {search.trim() && <> para “{search.trim()}”</>}
              {category !== 'all' && <> en {formatCategory(category)}</>}.
            </p>
            <button
              onClick={() => {
                setSearch('')
                setCategory('all')
              }}
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {!error && (
          <div className="grid">
            {visibleProducts.map((product) => {
              const availableStock = Math.max(getStock(product) - (cartQuantityByProduct[product.id] || 0), 0)

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  availableStock={availableStock}
                  inCart={cartQuantityByProduct[product.id] || 0}
                  onAdd={() => addToCart(product)}
                />
              )
            })}
          </div>
        )}
      </main>

      {showCart && (
        <Cart
          items={cart}
          total={total}
          getStock={getStock}
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
