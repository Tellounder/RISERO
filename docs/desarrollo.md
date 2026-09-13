# Desarrollo local

## Requisitos

- Node.js 22.12 o posterior.
- npm.
- Firebase CLI únicamente para tareas de despliegue autorizadas.

## Instalación

```bash
npm ci
npm run context:check
npm run dev
```

Vite informa la URL local. La landing se sirve en `/` y el panel en `/admin`.

## Controles antes de entregar

```bash
npm run context:check
npm run build
npm run preview
```

`context:check` comprueba la coherencia documental del proyecto. `build` valida TypeScript y genera `dist`. Ninguno de esos comandos publica cambios.

## Archivos principales

- `src/App.tsx`: experiencia pública.
- `src/Admin.tsx`: panel y procesamiento de imágenes.
- `src/projectCards.ts`: contrato de las cards.
- `src/firebase.ts`: SDK web.
- `src/styles.css`: sistema visual.
- `firestore.rules`: permisos y validaciones.

La configuración web de Firebase identifica la aplicación cliente; no es una clave administrativa. Las cuentas de servicio, tokens, archivos `.env` y logs locales nunca deben versionarse.
