# Preguntas frecuentes

## ¿Es esto una Evaluación de madurez tecnológica oficial?

No. Una TRA la realiza un equipo independiente conforme al proceso de una agencia. Esta herramienta
registra lo que se introduce y aplica las reglas de forma conservadora. Así lo indican todos los
resultados y todas las exportaciones.

## ¿El módulo ARL modifica el TRL?

No. El ARL se puntúa por separado y nunca se combina con un TRL. Véase
[Preparación para la adopción (ARL)](/guide/arl).

## ¿Se puede usar el resultado en una propuesta?

Como declaración propia de madurez, indicando el marco, la versión y las evidencias. No presentarlo
como independiente. Si una convocatoria establece sus propias definiciones de TRL, usar esas.

## ¿Por qué el resultado de la Fase 2 es inferior a la estimación de la Fase 1?

La Fase 2 exige evidencias para cada afirmación y todos los criterios obligatorios de un nivel, y
toma el _mínimo_ de los CTE críticos. Conviene revisar primero el CTE limitante.

## ¿Por qué «Sin certeza» cuenta como «No»?

Un nivel de madurez afirma que algo se ha demostrado. Si no hay certeza de que se demostrara, no se
puede afirmar.

## ¿Y si un criterio no aplica?

Marcarlo como **N/A** con una justificación: eso cuenta como satisfecho. Un N/A sin justificación no
cuenta.

## ¿Por qué el nivel indica «Sin criterios obligatorios — requiere confirmación del evaluador»?

La fuente del marco no clasifica los criterios como obligatorios, por lo que el nivel se alcanza en
cuanto se satisface un criterio aplicable, y el evaluador debe confirmarlo. Véase
[Marcos y fuentes](/guide/frameworks).

## ¿Dónde están los datos?

Solo en este navegador: la evaluación en `localStorage` y los archivos de evidencia en IndexedDB. La
aplicación no realiza ninguna petición de red. Los distintos navegadores y dispositivos no comparten
el almacenamiento.

## ¿Qué ocurre si se borran los datos del navegador?

Se pierden la evaluación y todos los archivos almacenados. Exportar antes el JSON o el paquete de
evidencias.

## ¿Se puede compartir el paquete de evidencias?

Sí. Los elementos marcados como «Sensible — solo referencia» nunca se incluyen; todo lo demás sí,
así que el `.zip` debe tratarse con la misma sensibilidad que su contenido. El manifiesto permite al
destinatario comprobar que nada ha cambiado.

## ¿Por qué no se puede adjuntar un archivo a un elemento «Sensible — solo referencia»?

Para mantener el material controlado fuera de la herramienta. En su lugar, registrar el título, el
custodio y un número de referencia.

## ¿Se puede editar el libro y volver a importarlo?

No. Los libros son instantáneas estáticas; volver a importar el JSON de la sesión en su lugar.

## ¿Se puede corregir un criterio o añadir un marco?

Los marcos son datos JSON. Abrir una incidencia **Criteria correction** con la fuente y la
referencia de página; véase `CONTRIBUTING.md`.
