import re
from pathlib import Path


ROOT = Path.cwd()
SRC = ROOT / "src"


CHECKS = [
    (
        "README declara ejercicio con 10 errores",
        ROOT / "README.md",
        r"10 errores",
    ),
    (
        "App principal existe",
        SRC / "App.jsx",
        r"function App",
    ),
    (
        "Carga productos desde DummyJSON",
        SRC / "App.jsx",
        r"https://dummyjson\.com/products",
    ),
    (
        "Usa estado para carrito",
        SRC / "App.jsx",
        r"useState\(\[\]\)",
    ),
    (
        "Renderiza tarjetas de producto",
        SRC / "ProductCard.jsx",
        r"function ProductCard",
    ),
    (
        "Renderiza panel de carrito",
        SRC / "Cart.jsx",
        r"function Cart",
    ),
    (
        "Tiene script de build",
        ROOT / "package.json",
        r'"build"\s*:\s*"vite build"',
    ),
]


RISK_PATTERNS = [
    (
        "Mutacion directa del carrito",
        SRC / "App.jsx",
        r"\bcart\.push\(",
        "React puede no re-renderizar de forma confiable si se reutiliza el mismo array.",
    ),
    (
        "Eliminacion por categoria",
        SRC / "App.jsx",
        r"\.filter\(\(c\)\s*=>\s*c\.category\s*!==\s*item\.category\)",
        "Eliminar por categoria puede borrar varios productos no deseados.",
    ),
    (
        "Cantidad puede bajar de 1",
        SRC / "App.jsx",
        r"quantity:\s*item\.quantity\s*\+\s*delta",
        "Restar unidades sin limite puede producir cero o numeros negativos.",
    ),
    (
        "Descuento tratado como monto fijo",
        SRC / "App.jsx",
        r"item\.price\s*-\s*item\.discountPercentage",
        "discountPercentage es porcentaje; debe aplicarse sobre el precio.",
    ),
    (
        "Busqueda sensible a mayusculas/minusculas",
        SRC / "App.jsx",
        r"p\.title\.includes\(search\)",
        "includes directo puede ocultar resultados por diferencias de mayusculas.",
    ),
]


def read_text(path):
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="latin-1")


def line_number(text, pattern):
    regex = re.compile(pattern)
    for index, line in enumerate(text.splitlines(), start=1):
        if regex.search(line):
            return index
    return None


def main():
    print(f"Proyecto: {ROOT}")
    print("\nComprobaciones basicas:")

    for label, path, pattern in CHECKS:
        if not path.exists():
            print(f"- FAIL {label}: no existe {path}")
            continue
        text = read_text(path)
        status = "OK" if re.search(pattern, text, re.MULTILINE) else "WARN"
        print(f"- {status} {label}: {path.relative_to(ROOT)}")

    print("\nPatrones de riesgo detectados:")
    found_any = False
    for label, path, pattern, note in RISK_PATTERNS:
        if not path.exists():
            continue
        text = read_text(path)
        line = line_number(text, pattern)
        if line is not None:
            found_any = True
            print(f"- {label}: {path.relative_to(ROOT)}:{line} - {note}")

    if not found_any:
        print("- No se detectaron los patrones de riesgo definidos.")


if __name__ == "__main__":
    main()
