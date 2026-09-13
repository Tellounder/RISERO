# Administración de contenido

## Acceso

El panel se encuentra en `/admin` y utiliza Google Authentication. Una cuenta sólo puede escribir si está autorizada tanto en `src/Admin.tsx` como en `firestore.rules`.

## Cards de proyectos

Cada card contiene:

- Imagen.
- Título.
- Tipo destacado.
- Género o motivo.
- Orden.
- Estado visible u oculto.

El límite funcional es de 15 cards totales, incluidas las ocultas. El panel comprueba ese máximo antes de publicar y las reglas validan cada documento.

## Imágenes

Las imágenes elegidas se reducen a un máximo de 1200 píxeles por lado y se convierten a WebP en el navegador. Se almacenan como Data URL dentro del documento de Firestore para evitar Firebase Storage y conservar la arquitectura gratuita actual.

No aumentar tamaño o cantidad sin revisar el límite por documento de Firestore y el impacto sobre la descarga del catálogo.

## Publicación segura

Guardar desde el panel reemplaza el conjunto administrado de `projectCards`. Antes de confirmar:

1. Revisar títulos, orden y visibilidad.
2. Comprobar que ninguna card supere el límite visual previsto.
3. Confirmar que la cuenta activa sea la correcta.
4. Verificar la landing después de guardar.

La lectura del catálogo es pública. La escritura depende de Google Authentication y de las reglas, no de mantener secreta la ruta `/admin`.
