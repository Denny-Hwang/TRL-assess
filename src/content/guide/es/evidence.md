# Evidencias

Un criterio obligatorio marcado como _Cumplido_ sin evidencias utilizables **no** cuenta.

:::figure evidence-decision:::

## Qué cuenta

Cualquier cosa que un revisor pueda examinar sin tener que preguntar.

| Tipo                  | Sólida                                                                                            | Débil                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Documento             | Un informe de ensayo firmado que identifique el artículo, las condiciones, la fecha y el operador | Notas de revisión sin fecha ni autoría                                   |
| Datos de ensayo       | Un archivo de datos junto con las condiciones y los criterios de aceptación                       | Una captura de pantalla de un gráfico con los ejes sin rotular           |
| Repositorio de código | Una URL **más un SHA de commit fijado**, la ruta y la etiqueta                                    | Un enlace a `main`                                                       |
| Plano/CAD             | Un plano liberado con una revisión que coincida con el artículo ensayado                          | Un boceto sin título en una diapositiva                                  |
| Foto/Vídeo            | Una fotografía fechada del artículo en ensayo, con escala                                         | Un render                                                                |
| Publicación (DOI)     | Un DOI que realmente respalde la afirmación                                                       | Un DOI de un dispositivo relacionado pero distinto                       |
| Enlace web            | Una página pública estable — instalación, norma, conjunto de datos                                | Una URL de resultados de búsqueda, o una página que exige iniciar sesión |
| Otro                  | Un certificado de calibración, un registro de auditoría                                           | «Ver la unidad compartida»                                               |

Registrar el artículo y su revisión, la fecha, el operador, las condiciones, los criterios de
aceptación y los resultados, incluidos los fallos. Un enlace a un repositorio necesita un SHA de
commit de 7 a 40 caracteres y una ruta.

## Entorno relevante frente a entorno operativo

Esta distinción separa TRL 5/6 de TRL 7/8.

:::figure environment-fidelity:::

- Un **entorno relevante** es "a set of stressing conditions, representative of the full spectrum
  of intended operational employments" (traducción: «un conjunto de condiciones exigentes,
  representativas de todo el espectro de empleos operativos previstos»), aplicado al elemento como
  parte de un componente (TRL 5) o de un sistema/subsistema (TRL 6) — `dod-tra-2025`, p. 12.
- Un **entorno operativo** es "a set of conditions, representative of the full spectrum of
  employments" (traducción: «un conjunto de condiciones representativas de todo el espectro de
  empleos»), aplicado a un prototipo (TRL 7) o al sistema real (TRL 8) — `dod-tra-2025`, p. 13.

"Full spectrum" («todo el espectro») significa que un único ensayo favorable no basta.

## Marcado

_Público_, _Interno (sin restricciones)_ o **Sensible — solo referencia**; con este último, la
herramienta **se niega a almacenar un archivo**: en su lugar, registrar el título, el custodio y un
número de referencia. No introducir nunca contenido clasificado, sujeto a control de exportaciones
ni CUI.

## Verificación

Cada evidencia está **Sin verificar**, **Verificado** o **Rechazado**, con un verificador y una
fecha. Solo _Rechazado_ afecta a la puntuación: las evidencias rechazadas se excluyen, de modo que un
criterio que se apoya únicamente en ellas deja de estar satisfecho.
