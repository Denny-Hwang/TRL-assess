# Salida en Excel

Los libros son instantáneas estáticas. Se abren en Microsoft Excel y LibreOffice e incluyen
validación de datos y formato condicional.

## Los dos libros

:::figure sheet-map:::

- **`Criteria_Assessment`** — una fila por cada combinación CTE × criterio, con la columna calculada
  _Satisfecho_ (_Satisfied_).
- **`Evidence_Register`** — todas las evidencias, seguidas de 50 filas en blanco (`EV-P001`…) que ya
  incluyen las listas de validación y la fórmula de la columna _Abrir_ (_Open_).
- **`Gap_Actions`** — los criterios obligatorios no cumplidos en el siguiente nivel de cada CTE, más
  20 filas en blanco.

## Libro de preparación para la adopción

El [módulo ARL](/guide/arl) exporta `ARL_<project>_<timestamp>.xlsx`, con las hojas `README`,
`Summary`, `Scope`, `Risk_Assessment` (una fila por dimensión, con el texto de la rúbrica),
`ARL_Lookup` (con las celdas inicial y objetivo marcadas), `References` y `Metadata`.

## Añadir evidencias en Excel

En `Evidence_Register`, una de estas opciones:

1. introducir **una URL** en _Ubicación / URL_ (_Location / URL_): _Abrir_ pasa a mostrar "Open
   link";
2. introducir **una ruta relativa al libro** en _Archivo local (ruta relativa)_ (_Local file
   (relative path)_), con el archivo en una carpeta `evidence/` junto al libro: _Abrir_ pasa a
   mostrar "Open file"; o
3. establecer _Marcado_ (_Marking_) en "Sensitive — reference only" y registrar el custodio y un
   número de referencia.

Para que los enlaces relativos sigan funcionando, **descomprimir el paquete completo antes de abrir
el libro**, y mover la carpeta, no el libro por separado.

## Los valores no se recalculan

Todas las cifras calculadas — Satisfecho, TRL de los CTE, el resumen, la completitud, la cobertura,
el ARL — son **valores estáticos** escritos en el momento de la exportación. Editar un estado en
Excel no cambia nada más. Hay que modificar la evaluación en la aplicación (o volver a importar el
JSON de la sesión) y exportar de nuevo.

El texto que empieza por `=`, `+`, `-` o `@` se escribe con un apóstrofo inicial para que no pueda
ejecutarse como fórmula.
