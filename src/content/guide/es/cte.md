# Elementos tecnológicos críticos

Un CTE es una parte del sistema cuya madurez determina si el sistema funciona. Se evalúan CTE, no
productos: «el nodo está en TRL 6» es un resumen; «el captador de energía está en TRL 4» es una
evaluación.

:::figure cte-tree:::

## Cinco preguntas para identificar un CTE

Un «sí» a cualquiera de ellas suele indicar que se trata de uno:

1. **¿Es nuevo, o se usa de forma nueva** — en un entorno, un modo o una escala nuevos?
2. **¿Depende de él el rendimiento?** Si rinde por debajo de lo esperado, ¿fracasa la misión?
3. **¿Hay una incertidumbre real de que funcione?** Sin demostración, la madurez es baja.
4. **¿Preguntaría primero por él un revisor experto?**
5. **¿Está en la ruta crítica hacia el siguiente hito?**

Normalmente **no** son CTE: las piezas de catálogo usadas dentro de sus valores nominales, las
bibliotecas usadas según lo previsto y todo lo que ya se ha probado en el mismo entorno.

## El ejemplo

La sesión de ejemplo tiene tres CTE: captador de energía, módulo de gestión de energía y firmware
de telemetría. Un procedimiento, como la instalación, también puede ser un CTE (tipo _proceso_).

## Errores comunes

| Error                                 | Corrección                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| Un solo CTE para todo el sistema      | Dividir donde los subsistemas estén en etapas visiblemente distintas.          |
| Un CTE por placa o pieza              | Fusionar los elementos que siempre compartirían estado y evidencias.           |
| Todo marcado como crítico             | Marcar solo lo que condiciona la misión; el resumen es el mínimo.              |
| Nada marcado como crítico             | Marcar al menos uno; de lo contrario no se calcula ningún resumen del sistema. |
| «Crítico» entendido como «importante» | Una parte importante solo es un CTE si algo en ella no está demostrado.        |

Entre tres y ocho CTE suele ser lo adecuado para un proyecto a escala de dispositivo.
