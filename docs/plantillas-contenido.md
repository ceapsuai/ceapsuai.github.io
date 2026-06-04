# Plantillas de Contenido CEAPS

Este archivo sirve para publicar contenido real sin tocar el diseño de la web. El formato visual lo controlan `index.html`, `detalle.html`, `assets/css/styles.css` y `assets/js/`. Para publicar, normalmente solo debes editar `data/content.json`.

Antes de reemplazar ejemplos, quedó guardado un respaldo en:

```text
data/content-ejemplo.json
```

## Reglas rápidas

- Copia una plantilla completa y pégala dentro del arreglo `"items"` en `data/content.json`.
- Cada publicación debe tener un `id` único, sin espacios ni tildes. Ejemplo: `columna-reforma-tributaria-2026`.
- Las fechas usan formato `YYYY-MM-DD`. Ejemplo: `2026-05-23`.
- No uses saltos de línea reales dentro de textos JSON. Usa `\n\n` para separar párrafos dentro de un mismo campo.
- Recuerda poner coma entre publicaciones, excepto después de la última.

## Bloques para el cuerpo

Dentro de `"body"` puedes combinar estos bloques:

```json
{
  "type": "lead",
  "text": "Párrafo inicial destacado."
}
```

```json
{
  "type": "paragraph",
  "text": "Párrafo normal del texto."
}
```

```json
{
  "type": "heading",
  "text": "Subtítulo interno"
}
```

```json
{
  "type": "quote",
  "text": "Cita o frase destacada."
}
```

```json
{
  "type": "list",
  "items": [
    "Primer punto.",
    "Segundo punto.",
    "Tercer punto."
  ]
}
```

## Columna de Opinión

```json
{
  "id": "columna-titulo-corto",
  "type": "opinion",
  "category": "estudiantil",
  "title": "Título de la columna",
  "summary": "Resumen breve que aparece en la tarjeta.",
  "excerpt": "Frase breve opcional para destacar el argumento.",
  "date": "2026-05-23",
  "author": {
    "id": "nombre-autor",
    "name": "Nombre Autor",
    "role": "Cargo, carrera o afiliación",
    "initials": "NA"
  },
  "tags": [
    "Tema 1",
    "Tema 2",
    "Tema 3"
  ],
  "body": [
    {
      "type": "lead",
      "text": "Primer párrafo destacado de la columna."
    },
    {
      "type": "paragraph",
      "text": "Primer párrafo normal."
    },
    {
      "type": "heading",
      "text": "Subtítulo"
    },
    {
      "type": "paragraph",
      "text": "Segundo párrafo normal."
    }
  ]
}
```

Para columna académica, usa:

```json
"category": "academica"
```

## Noticia

```json
{
  "id": "noticia-titulo-corto",
  "type": "news",
  "category": "club",
  "title": "Título de la noticia",
  "summary": "Resumen breve de la noticia.",
  "date": "2026-05-23",
  "tags": [
    "CEAPS",
    "Comunidad",
    "Actualidad"
  ],
  "body": [
    {
      "type": "lead",
      "text": "Entrada destacada de la noticia."
    },
    {
      "type": "paragraph",
      "text": "Desarrollo de la noticia."
    }
  ]
}
```

## Evento

```json
{
  "id": "evento-titulo-corto",
  "type": "event",
  "category": "charla",
  "title": "Título del evento",
  "summary": "Resumen breve del evento.",
  "date": "2026-05-23",
  "event": {
    "date": "2026-06-05",
    "time": "17:30",
    "place": "Sala o lugar"
  },
  "tags": [
    "Evento",
    "Tema",
    "Invitados"
  ],
  "cta": {
    "label": "Inscribirme",
    "href": "mailto:contacto@ceaps.cl?subject=Inscripción%20evento%20CEAPS"
  },
  "body": [
    {
      "type": "lead",
      "text": "Descripción inicial del evento."
    },
    {
      "type": "heading",
      "text": "Programa"
    },
    {
      "type": "list",
      "items": [
        "17:30 · Apertura.",
        "17:40 · Presentación.",
        "18:20 · Preguntas."
      ]
    }
  ]
}
```

## Oportunidad

```json
{
  "id": "oportunidad-titulo-corto",
  "type": "opportunity",
  "category": "convocatoria",
  "title": "Título de la oportunidad",
  "summary": "Resumen breve de la convocatoria.",
  "date": "2026-05-23",
  "deadline": "2026-06-10",
  "author": {
    "id": "equipo-ceaps",
    "name": "Equipo CEAPS",
    "role": "Convocatoria",
    "initials": "CE"
  },
  "tags": [
    "Convocatoria",
    "Investigación",
    "Postulación"
  ],
  "cta": {
    "label": "Postular",
    "href": "mailto:contacto@ceaps.cl?subject=Postulación%20CEAPS"
  },
  "body": [
    {
      "type": "lead",
      "text": "Descripción inicial de la oportunidad."
    },
    {
      "type": "heading",
      "text": "Requisitos"
    },
    {
      "type": "list",
      "items": [
        "Primer requisito.",
        "Segundo requisito.",
        "Tercer requisito."
      ]
    }
  ]
}
```

## Paper o Documento

```json
{
  "id": "paper-titulo-corto",
  "type": "paper",
  "category": "Economía política",
  "title": "Título del paper o documento",
  "summary": "Resumen breve del paper.",
  "date": "2026-05-23",
  "author": {
    "id": "apellido-n",
    "name": "Apellido, N.; Apellido, N.",
    "role": "Documento de trabajo",
    "initials": "AA"
  },
  "tags": [
    "Investigación",
    "Datos",
    "Chile"
  ],
  "body": [
    {
      "type": "lead",
      "text": "Resumen inicial del argumento o hallazgo principal."
    },
    {
      "type": "heading",
      "text": "Hallazgos principales"
    },
    {
      "type": "list",
      "items": [
        "Primer hallazgo.",
        "Segundo hallazgo.",
        "Tercer hallazgo."
      ]
    }
  ]
}
```

## Boletín

```json
{
  "id": "boletin-01-titulo-corto",
  "type": "newsletter",
  "category": "boletin",
  "issue": "#01",
  "title": "Título del boletín",
  "summary": "Resumen breve de la edición.",
  "date": "2026-05-23",
  "tags": [
    "Boletín",
    "Tema 1",
    "Tema 2"
  ],
  "body": [
    {
      "type": "lead",
      "text": "Entrada destacada del boletín."
    },
    {
      "type": "heading",
      "text": "Contenidos"
    },
    {
      "type": "list",
      "items": [
        "Primer contenido.",
        "Segundo contenido.",
        "Tercer contenido."
      ]
    }
  ]
}
```

## Equipo Directivo

Los miembros del equipo se editan en `teamPage.members`, no en `items`.
Si un integrante publica columnas, usa el mismo identificador en `authorId` del integrante y en `author.id` de sus columnas. Así aparecerá automáticamente el enlace `Columnas de opinión` en su tarjeta.

```json
{
  "name": "Nombre Apellido",
  "role": "Cargo CEAPS",
  "authorId": "nombre-apellido",
  "image": "assets/img/equipo/foto.jpg",
  "text": "Primer párrafo.\n\nSegundo párrafo.",
  "email": "correo@alumnos.uai.cl",
  "link": ""
}
```

Si no quieres foto todavía, deja:

```json
"image": ""
```
