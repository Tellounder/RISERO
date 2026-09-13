# Instrucciones de continuidad — Rise Difusión

Antes de modificar este proyecto:

1. Leer `knowledge/CANONICAL_CONTEXT.md`.
2. Para una consulta puntual ejecutar `npm run context:search -- "tema"`.
3. Ejecutar `npm run context:check` antes y después de cambios estructurales.
4. Contrastar la documentación con el código y la configuración en runtime; el estado real tiene prioridad.

Reglas operativas:

- No desplegar Hosting o reglas, ni crear commits o pushes, sin autorización explícita para cada acción.
- Antes de publicar verificar proyecto Firebase, cuenta activa, build, destino y servicios exactos.
- El proyecto Firebase canónico es `risedifusion`; no inferir otros destinos.
- No guardar secretos, claves privadas ni credenciales de cuentas de servicio en Git o en `knowledge/`.
- Firebase Storage no se utiliza: requiere Blaze. Las imágenes administrables se comprimen a WebP y se guardan en Firestore.
- El límite funcional es de 15 cards totales, visibles u ocultas.
- Al cambiar dominios, administradores, modelo Firestore, rutas, límite de cards o procedimiento de deploy, actualizar `knowledge/CANONICAL_CONTEXT.md`.
