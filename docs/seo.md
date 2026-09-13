# SEO y publicación

## Dominio canónico

La URL oficial es `https://risedifusion.com.ar/`. El título, la descripción, Open Graph, Twitter Cards, JSON-LD, `robots.txt` y `sitemap.xml` deben conservar ese origen.

La identidad pública utiliza exclusivamente **Rise Difusión**. El antiguo nombre interno del proyecto no debe aparecer en contenido visible, metadatos ni datos estructurados.

## Señales implementadas

- Un único H1 y jerarquía H2/H3 natural.
- Título y descripción orientados a distribución musical mediante RouteNote.
- Canonical y variantes de idioma.
- `Organization`, `ProfessionalService`, `OfferCatalog`, `FAQPage` y `WebSite` en JSON-LD.
- Open Graph y Twitter Cards con imagen de 1200 × 630.
- `robots.txt` con bloqueo de `/admin`.
- Sitemap sobre el dominio oficial.

Google puede elegir otro título o fragmento y necesita volver a rastrear una página para reflejar cambios. El código sólo puede ofrecer señales coherentes; no puede imponer el resultado ni una posición.

## Publicar Hosting

Sólo con autorización explícita:

```bash
firebase use
npm run context:check
npm run build
firebase deploy --only hosting --project risedifusion
```

Las reglas se despliegan por separado y requieren una autorización específica:

```bash
firebase deploy --only firestore:rules --project risedifusion
```

Después del deploy se deben verificar la home, `/admin`, los assets, `robots.txt`, `sitemap.xml`, los metadatos live y la lectura pública de `projectCards`.
