# Contexto canónico de Rise Difusión

Última revisión manual: 2026-08-30.

## Identidad y objetivo

Este proyecto contiene la landing oficial de Rise Difusión. Presenta servicios de distribución musical mediante RouteNote, difusión de lanzamientos, publicación de letras, páginas web y presencia digital para artistas y proyectos independientes. La identidad pública y las señales SEO utilizan únicamente el nombre Rise Difusión.

La web pública incluye servicios, plataformas, trabajos realizados, preguntas frecuentes, contacto por WhatsApp y enlaces sociales. El panel `/admin` permite mantener la sección `Artistas y proyectos que pasaron por Rise` sin editar código.

## Producción y dominios

- Dominio canónico: `https://risedifusion.com.ar/`.
- Panel: `https://risedifusion.com.ar/admin`.
- Hosting alternativo: `https://risedifusion.web.app`.
- `www.risedifusion.com.ar` está configurado en Firebase para redirigir al dominio canónico.
- DNS autoritativo: Cloudflare Free, delegado desde NIC Argentina.
- Firebase Hosting gestiona el certificado HTTPS.

`index.html`, Open Graph, Twitter, JSON-LD, `robots.txt` y `sitemap.xml` deben utilizar el dominio canónico. `/admin` debe permanecer fuera de buscadores.

## Stack y arquitectura

- React 19, TypeScript y Vite 8.
- Font Awesome para iconografía.
- Firebase Authentication con Google.
- Cloud Firestore para las cards administrables.
- Firebase Hosting para el frontend estático.
- Backend propio: no existe.
- Firebase Storage: no se utiliza para evitar el plan Blaze.

Entradas principales:

- `src/App.tsx`: landing pública.
- `src/Admin.tsx`: panel administrativo.
- `src/projectCards.ts`: contrato, contenido inicial y suscripción Firestore.
- `src/firebase.ts`: inicialización del SDK web.
- `src/styles.css`: estilos públicos y administrativos.
- `firestore.rules`: autorización y validación de escrituras.

## Cards administrables

Colección Firestore: `projectCards`.

Cada documento contiene:

- `title`: título público.
- `type`: tipo destacado, por ejemplo `Artista / banda` o `Proyecto musical`.
- `genre`: género o motivo.
- `image`: referencia a un asset inicial o imagen WebP en Data URL.
- `order`: posición entre 0 y 14.
- `visible`: estado público.

El límite funcional es `MAX_PROJECT_CARDS = 15`, definido en `src/projectCards.ts`. El panel bloquea nuevas cards al alcanzar el máximo, valida el total antes de publicar y las reglas exigen `order < 15`. Las reglas de Firestore no pueden contar documentos de una colección; la garantía de cantidad depende del panel y de que solo existan administradores confiables.

Las imágenes nuevas se procesan en el navegador, se reducen a un máximo de 1200 px por lado y se convierten a WebP antes de guardarse. Cada string de imagen debe quedar por debajo de 650.000 caracteres según las reglas. Firestore descarga el documento completo, por eso no se debe aumentar el límite sin rediseñar almacenamiento, paginación y carga.

Si la colección está vacía o falla la lectura, la landing utiliza las cinco cards incluidas en el bundle. El primer `Guardar y publicar` crea los documentos remotos.

## Administración y seguridad

`/admin` usa Google Authentication. Solo están autorizadas las cuentas declaradas conjuntamente en `src/Admin.tsx` y `firestore.rules`. Mantener ambas listas alineadas.

Las lecturas de `projectCards` son públicas. Crear, editar y eliminar requiere un token Google verificado y un correo autorizado. Cualquier otra colección queda denegada por defecto.

La configuración web de Firebase es identificadora y puede estar en el cliente; la seguridad real depende de Authentication y las reglas. Una cuenta de servicio no es necesaria para ejecutar, compilar ni desplegar esta aplicación. Nunca confirmar archivos `*firebase-adminsdk*.json`, claves privadas, tokens del CLI ni secretos en Git.

## Firebase

- Project ID: `risedifusion`.
- App web: `risero-web`.
- Alias local: `default` en `.firebaserc`.
- Firestore: edición Standard, base `(default)`, región `southamerica-east1` y free tier.
- Hosting sirve `dist` con rewrite SPA a `index.html`.
- Authentication: proveedor Google habilitado.
- Dominios autorizados: Firebase predeterminados, `localhost` y `risedifusion.com.ar`.

## SEO y presencia pública

La home conserva un único H1 y usa H2/H3 visibles y naturales. La intención principal combina Rise Difusión, distribución musical mediante RouteNote, difusión de lanzamientos, transcripción y publicación de letras, redes sociales, Spotify, Apple Music, YouTube Music y soluciones digitales para artistas independientes de Argentina. Estas expresiones deben distribuirse semánticamente y no repetirse como texto oculto o listas artificiales.

`index.html` contiene title, description, canonical, Open Graph, Twitter y JSON-LD para `Organization`, `ProfessionalService`, `OfferCatalog`, `FAQPage` y `WebSite`. Rise Difusión es la única marca pública principal; `RISERO` no debe aparecer en metadatos, contenido visible ni datos estructurados. `Rise Difusión Musical` puede mantenerse como variante descriptiva. Las preguntas estructuradas deben coincidir con las preguntas visibles. Rise enlaza Instagram y Facebook `@rise.difusion`. Tellounder figura como creador y desarrollador, enlazado a `https://www.instagram.com/tellounder/`.

La imagen social es `public/og-rise-black.png`, con fondo negro para compartir correctamente en WhatsApp. `public/robots.txt` permite la landing, bloquea `/admin` y referencia `public/sitemap.xml`.

## Publicación segura

No desplegar por inferencia. Antes de Hosting:

```powershell
firebase use
npm run context:check
npm run build
firebase deploy --only hosting --project risedifusion
```

Las reglas se publican por separado y requieren autorización explícita:

```powershell
firebase deploy --only firestore:rules --project risedifusion
```

Antes de cada deploy comprobar destino, cuenta, archivos, build y servicio solicitado. Después verificar la home, `/admin`, `robots.txt`, `sitemap.xml` y la lectura pública de Firestore. Un build o deploy exitoso no reemplaza el smoke test remoto.

## Git y GitHub

El repositorio no debe contener `node_modules`, `dist`, `.firebase`, logs ni credenciales de cuentas de servicio. Antes de cada commit ejecutar una búsqueda de secretos y revisar exactamente los archivos staged. No usar `git add .` ni variantes globales; agregar rutas explícitas.

El repositorio canónico es `https://github.com/Tellounder/RISERO`, público y presentado como caso de estudio profesional de TELLOUNDER. El README debe explicar problema, solución, alcance, decisiones verificables, arquitectura, ejecución, seguridad, autoría y límites de reutilización. El dominio público del producto sigue siendo `https://risedifusion.com.ar/`.

## Verificaciones rápidas

```powershell
npm run context:search -- "tema a recuperar"
npm run context:check
npm run build
```

`context:check` valida coherencia local; no consulta Firebase, Cloudflare ni producción.

## Mantenimiento de esta memoria

Actualizar este documento cuando cambie alguno de estos invariantes: dominio, project ID, cuentas administradoras, modelo Firestore, límite de cards, estrategia de imágenes, rutas, WhatsApp, SEO o proceso de publicación.

No registrar tareas pasajeras, imágenes codificadas, logs extensos ni secretos. Para conocer el estado real, inspeccionar los archivos citados y verificar el servicio correspondiente.
