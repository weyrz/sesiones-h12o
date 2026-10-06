# Cómo modificar la agenda

## Editor con formularios

Abre `editor.html` junto a la agenda (en GitHub Pages: `/sesiones-h12o/editor.html`) y guarda esa dirección como favorito. La agenda pública no muestra ningún botón para editar.

Selecciona Sesiones o Seminarios. Pulsa «Añadir entrada» o «Editar», completa el formulario y guarda. También puedes ocultar entradas o eliminarlas del borrador. Los cambios se guardan en este navegador; no cambian la agenda pública ni los archivos originales. Si borras los datos del navegador, puedes perder el borrador. Descarga tus datos como copia de seguridad.

Para publicar, pulsa «Descargar datos para publicar». Ambos archivos se llaman `data.js`: para Sesiones sustituye el archivo de la raíz del sitio; para Seminarios sustituye `seminarios/data.js`. En GitHub abre el archivo correspondiente, edítalo, pega el contenido descargado y confirma el cambio. Repite para la otra agenda si has modificado ambas.

El editor conserva el borrador local aunque publiques nuevos datos en GitHub. El editor no tiene contraseña: quien lo abra puede editar su propia copia local, pero publicar requiere acceso al repositorio.

## Edición manual

1. Abre `data.js` con un editor de texto.
2. Cada línea entre `{` y `}` representa una sesión.
3. Modifica los campos necesarios y guarda el archivo.
4. Actualiza la página del navegador para ver los cambios.

Ejemplo:

```js
{ date:'2026-11-19', title:'Nuevo tema', area:'Servicio', owner:'Nombre del ponente', reviewer:'Nombre del revisor', format:'Programada' }
```

Para ocultar una entrada sin borrarla, añade `hidden:true`:

```js
{ date:'2026-11-19', title:'Tema reservado', area:'Servicio', owner:'Nombre', reviewer:'', format:'Programada', hidden:true }
```

Campos:

- `date`: siempre `AAAA-MM-DD`, por ejemplo `2026-11-19`.
- `title`: título de la sesión.
- `area`: categoría que aparecerá en el filtro Área.
- `owner`: ponente o responsable.
- `reviewer`: revisor. Puede quedar vacío: `''`.
- `format`: usa `Programada` o `No hay sesión`. Una sesión `Programada` cambia automáticamente a `Realizada` cuando llega su fecha.
- `hidden`: opcional. Usa `hidden:true` para ocultar temporalmente una entrada. Elimina el campo o usa `hidden:false` para volver a mostrarla.

Para añadir una sesión, copia una línea completa y añade una coma al final de la línea anterior. Para eliminarla, borra la línea completa.

No cambies `index.html`, `styles.css` ni `app.js` para actualizar el contenido. Esos archivos controlan la estructura, el diseño y el funcionamiento de la página.

## Seminarios

Los seminarios se editan por separado en `seminarios/data.js`. Usa exactamente los mismos campos. El interruptor superior cambia automáticamente entre ambas fuentes de datos.
