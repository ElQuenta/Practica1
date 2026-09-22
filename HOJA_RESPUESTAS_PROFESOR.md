# Hoja de respuestas (SOLO PROFESOR — no compartir con alumnos)

Tienda Tech (React + Vite + API DummyJSON). El proyecto tiene **exactamente 10 errores**.
El resto del código está limpio a propósito, para que cada error sea evaluable.

## Resumen

| # | Tipo | Error | Archivo |
|---|---|---|---|
| 1 | Lógica / estado | Mutación directa del estado del carrito | App.jsx |
| 2 | Lógica | Productos duplicados en vez de sumar cantidad | App.jsx |
| 3 | Lógica | Descuento mal calculado | App.jsx |
| 4 | Lógica | Eliminar borra por categoría en vez de por producto | App.jsx |
| 5 | Lógica | Cantidad puede llegar a 0 o a números negativos | App.jsx |
| 6 | Datos / API | Sin manejo de errores en `fetch` | App.jsx |
| 7 | Datos / API | Búsqueda local sensible a mayúsculas | App.jsx |
| 8 | Visual | Carrito queda detrás de la página (`z-index: -1`) | App.css |
| 9 | Visual | Botón "Agregar" con texto casi invisible | App.css |
| 10 | Visual | Imagen que se sale de la tarjeta | App.css |

## Detalle

### 1. Mutación directa del estado
- **Dónde:** `addToCart` en App.jsx (`cart.push(...)` y `setCart(cart)`).
- **Síntoma:** al hacer clic en "Agregar", el contador "Carrito (n)" no cambia. Aparece hasta que ocurre otro renderizado (por ejemplo, al escribir en el buscador).
- **Corrección:** `setCart((prev) => [...prev, { ...product, quantity: 1 }])`.

### 2. Productos duplicados
- **Dónde:** `addToCart` en App.jsx.
- **Síntoma:** agregar el mismo producto dos veces crea dos líneas en el carrito en vez de subir la cantidad a 2. (Se ve mejor después de corregir el #1.) Además, `key={item.id}` genera advertencias de claves repetidas en consola.
- **Corrección:** buscar por `id`; si existe, aumentar `quantity`; si no, agregarlo.

### 3. Descuento mal calculado
- **Dónde:** `total` en App.jsx: `(item.price - item.discountPercentage)`.
- **Síntoma:** `discountPercentage` es un porcentaje (ej. 7.17), pero se resta como si fueran dólares. El total sale incorrecto.
- **Corrección:** `item.price * (1 - item.discountPercentage / 100) * item.quantity`.

### 4. Eliminar borra por categoría
- **Dónde:** `removeFromCart` en App.jsx (`c.category !== item.category`).
- **Síntoma:** al quitar un producto desaparecen todos los de la misma categoría.
- **Corrección:** comparar por `id`: `c.id !== item.id`.

### 5. Cantidad sin límites
- **Dónde:** `changeQty` en App.jsx.
- **Síntoma:** al pulsar "-" se llega a 0 y a cantidades negativas; el total se vuelve negativo. Tampoco respeta `stock`.
- **Corrección:** mínimo 1 (o eliminar el producto al llegar a 0) y máximo `item.stock`.

### 6. Sin manejo de errores en `fetch`
- **Dónde:** `useEffect` en App.jsx.
- **Síntoma:** si no hay internet o la API falla, se queda "Cargando..." para siempre y no hay mensaje de error. (Prueba: DevTools → Network → Offline y recargar.)
- **Corrección:** revisar `res.ok`, usar `.catch` o `try/catch`, añadir estado `error`, y apagar `loading` con `finally`.

### 7. Búsqueda sensible a mayúsculas
- **Dónde:** `visibleProducts`, segundo `.filter((p) => p.title.includes(search))` en App.jsx.
- **Síntoma:** la API ya filtra la búsqueda, pero el filtro local vuelve a filtrar distinguiendo mayúsculas. Buscar "mascara" (minúscula) devuelve resultados de la API y el filtro local los oculta: "Sin resultados".
- **Corrección:** eliminar el filtro local (la API ya busca) o usar `toLowerCase()` en ambos lados.

### 8. Carrito detrás de la página
- **Dónde:** `.cart` en App.css (`z-index: -1`).
- **Síntoma:** al abrir el carrito, el panel queda detrás del contenido y no se puede usar bien.
- **Corrección:** `z-index` positivo (ej. `z-index: 10`).

### 9. Botón "Agregar" ilegible
- **Dónde:** `.add-btn` en App.css (`background: #4a90d9; color: #5a9ae0`).
- **Síntoma:** texto azul casi igual al fondo azul; contraste muy bajo (incumple WCAG).
- **Corrección:** por ejemplo `color: #fff` (contraste mínimo 4.5:1).

### 10. Imagen que se sale de la tarjeta
- **Dónde:** `.card img` en App.css (`width: 300px`).
- **Síntoma:** en pantallas donde la tarjeta mide menos de 300px, la imagen desborda y se encima con la tarjeta vecina.
- **Corrección:** `width: 100%` (con `height` fijo y `object-fit: contain`).

## Sugerencia para la clase

1. Los alumnos usan la app y anotan los síntomas que ven.
2. Usan la IA para diagnosticar y corregir. Pídeles que **verifiquen** cada arreglo.
3. Entregan: lista de errores encontrados, la corrección y los prompts que usaron.
4. Comparas contra esta hoja. Los más difíciles de detectar son el #6 (hay que simular fallo de red), el #7 (requiere buscar en minúsculas) y el #2 (solo se nota después de arreglar el #1).

Orden sugerido de dificultad: 8, 9, 10 (fáciles) → 4, 3, 5 (medios) → 1, 2, 6, 7 (más sutiles).
