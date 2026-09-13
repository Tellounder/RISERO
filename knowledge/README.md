# RAG-lite de Rise Difusión

Esta carpeta conserva la memoria recuperable de Rise Difusión. No usa embeddings, APIs ni servicios externos: el buscador divide los Markdown por secciones, normaliza la consulta y devuelve los bloques con mayor coincidencia.

```powershell
npm run context:search -- "Firebase admin"
npm run context:search -- "cards e imágenes"
npm run context:search -- "dominio y SEO"
npm run context:check
```

`CANONICAL_CONTEXT.md` es la fuente documental principal. Debe registrar hechos estables, rutas, contratos y procedimientos. Nunca debe contener claves privadas, tokens, contraseñas ni copias de credenciales.
