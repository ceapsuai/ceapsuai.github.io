# CEAPS

Sitio estático para el Club de Economía, Actualidad Política y Sociedad.

## Estructura

- `index.html`: portada del sitio.
- `detalle.html`: página que muestra el contenido completo según `?id=...`.
- `equipo.html`: página del equipo directivo.
- `data/content.json`: fuente principal de información editable.
- `data/content-ejemplo.json`: respaldo del contenido de ejemplo.
- `docs/plantillas-contenido.md`: plantillas para publicar columnas, eventos, noticias, papers, boletines y oportunidades.
- `assets/js/`: carga de datos, render de portada y detalle.
- `assets/css/styles.css`: diseño responsive con paleta CEAPS.
- `.nojekyll`: evita procesamiento de Jekyll en GitHub Pages.

## Cómo actualizar contenido

Edita `data/content.json`. Cada publicación debe tener un `id` único, `type`, `title`, `summary`, `date`, `tags` y un arreglo `body`.

La versión activa de `data/content.json` está limpia: no contiene publicaciones ficticias visibles. El contenido de ejemplo quedó respaldado en `data/content-ejemplo.json`.

Para crear contenido real sin romper el formato, copia una plantilla desde `docs/plantillas-contenido.md` y pégala dentro del arreglo `"items"` en `data/content.json`.

Puedes preparar contenido sin publicarlo usando:

```json
"draft": true
```

Las publicaciones con `draft: true` no aparecen en la portada ni abren en la página de detalle.

La sección `teamPage.members` controla los cuadros del equipo directivo. Para usar fotos, sube la imagen a `assets/img/equipo/` y escribe esa ruta en el campo `image`.

Los tipos disponibles son:

- `newsletter`
- `opinion`
- `paper`
- `event`
- `news`
- `opportunity`

Los enlaces de detalle se generan automáticamente como:

```text
detalle.html?id=ID_DE_LA_PUBLICACION
```

## GitHub Pages

Publica la carpeta completa en la rama usada por GitHub Pages. No requiere build ni dependencias.

Para dominio propio, agrega un archivo `CNAME` en la raíz con el dominio final, por ejemplo:

```text
www.ceaps.cl
```
