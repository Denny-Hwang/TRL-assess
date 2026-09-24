# Cómo usar esta herramienta

Todo se ejecuta en el navegador. No se sube nada y no hay cuentas.

## Fase 1 — Estimación rápida (unos 5 minutos)

1. **Contexto.** Proyecto, tecnología y evaluador, además del _entorno alcanzado_ (E0–E4) y la
   _madurez de construcción_ (B0–B5), que alimentan la comprobación cruzada.
2. **Nueve preguntas, empezando por TRL 9.** Responder **Sí**, **No** o **Sin certeza** para la
   tecnología en su conjunto. Teclado: `Y` `N` `U` para responder, flechas para desplazarse.
3. **Resultado.** TRL estimado, nivel más alto declarado, comprobación cruzada, calificación de
   coherencia y alertas. Descargar el libro o el JSON.

## Fase 2 — Evaluación basada en evidencias

1. **Identificar los CTE** — véase [Elementos tecnológicos críticos](/guide/cte). Marcar como
   críticos los que deben contar para el resumen del sistema.
2. **Evaluar los criterios** de cada CTE, subiendo desde TRL 1:

:::figure status-legend:::

3. **Adjuntar evidencias** con **Gestionar**, junto a cada criterio. Un criterio obligatorio marcado
   como _Cumplido_ sin evidencias **no** cuenta. Véase [Evidencias](/guide/evidence).
4. **Leer los resultados:** el TRL de cada CTE, el resumen del sistema, el CTE limitante y la lista
   de brechas.
5. **Exportar.** El libro es el registro; el paquete de evidencias (.zip) añade los archivos con un
   manifiesto SHA-256.

## Preparación para la adopción — ARL

1. **Alcance.** Proyecto, alcance tecnológico, alcance de la cadena de valor, horizonte temporal y
   entorno normativo y de políticas.
2. **Calificar** cada una de las 17 dimensiones, con una justificación, y fijar objetivos al final
   del proyecto allí donde el proyecto vaya a reducir un riesgo.
3. **Resultado.** ARL inicial, ARL final y el perfil de riesgo. Descargar el libro ARL o el JSON.

_Restablecer ARL_ borra solo las calificaciones ARL. Véase
[Preparación para la adopción (ARL)](/guide/arl).

## Guardar, compartir, borrar

|                |                                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Autoguardado   | En este navegador: `localStorage` para la evaluación, IndexedDB para los archivos de evidencia. Borrar los datos del sitio los elimina.    |
| Traspaso       | **Descargar JSON** / **Importar JSON** transfieren todo salvo el contenido de los archivos; el paquete de evidencias incluye los archivos. |
| Sincronización | Ninguna. Los distintos navegadores, perfiles y dispositivos no comparten el almacenamiento.                                                |
| Borrado        | **Borrar todos los datos locales** elimina la sesión y todos los archivos almacenados de este navegador. Exportar antes.                   |
