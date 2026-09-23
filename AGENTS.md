# Repository Guidelines

## Project Structure & Module Organization

This repository contains a small React 18 + Vite storefront. Source code lives in `src/`: `main.jsx` mounts the app, `App.jsx` owns application state and data loading, `ProductCard.jsx` renders product cards, `Cart.jsx` renders the cart panel, and `App.css` contains global styling. Static entry files are `index.html` and `vite.config.js`. Build output is generated in `dist/` and must not be committed. Dependencies live in `node_modules/` and are restored with `npm i`.

## Build, Test, and Development Commands

Use these commands from the repository root:

```bash
npm i
```

Installs dependencies from `package-lock.json`.

```bash
npm run dev
```

Starts the Vite development server, usually at `http://localhost:5173/`.

```bash
npm run build
```

Creates the production build in `dist/`.

```bash
npm run preview
```

Serves the production build locally for a final check.

## Coding Style & Naming Conventions

Write React components as function components in `.jsx` files. Use PascalCase for components (`ProductCard`, `Cart`) and camelCase for state, functions, and props (`addToCart`, `visibleProducts`). Keep indentation at two spaces, prefer single quotes, and omit semicolons to match the current code. Keep styles in `src/App.css` unless a larger feature justifies splitting files.

## Testing Guidelines

No automated test framework is configured yet. For now, verify changes manually with `npm run dev` and run `npm run build` before committing. If tests are added later, prefer Vitest with React Testing Library and name files as `*.test.jsx` beside the component being tested.

## Commit & Pull Request Guidelines

The existing history uses short Spanish commit messages such as `arreglos` and `Ignorar archivos generados y documentos markdown`. Keep commits concise and action-oriented, for example `Corregir calculo del carrito`. Pull requests should include a short description, manual verification steps, and screenshots for visible UI changes.

## Security & Configuration Tips

Do not commit generated folders, local environment files, or answer guides. Markdown files are ignored by default, with exceptions for `README.md` and this `AGENTS.md`.
