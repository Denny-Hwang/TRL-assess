# Metodología

No se pondera nada y no se infiere nada.

## Reglas de la Fase 1

| Regla                                    | Qué hace                                                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **TRL estimado** (la cifra principal)    | El nivel L más alto en el que L _y todos los niveles inferiores_ se respondieron «Sí». Si TRL 1 no es «Sí», es «< TRL 1». |
| **Nivel más alto declarado**             | El «Sí» individual más alto, sin tener en cuenta las brechas.                                                             |
| **«Sin certeza» nunca cuenta como «Sí»** | «No» tampoco. Un «Sin certeza» en TRL 3 limita la estimación a TRL 2.                                                     |
| **Alerta de brecha**                     | Se genera cuando el nivel más alto declarado supera la estimación; indica los niveles sin confirmar.                      |
| **Alerta de «Sin certeza»**              | Se genera cuando alguna respuesta en el nivel más alto declarado o por debajo es «Sin certeza».                           |

**Comprobación cruzada.** La madurez de construcción (B0–B5) × el entorno (E0–E4) sugiere un TRL. Es
una heurística de esta herramienta, no una norma, y solo alimenta la calificación de coherencia.

:::figure cross-check-matrix:::

**Calificación de coherencia.** _Baja_: la comprobación cruzada difiere de la estimación en 3 o más,
o una brecha abarca 2 o más niveles. _Alta_: ninguna alerta de brecha ni de «Sin certeza», y la
comprobación cruzada a 1 o menos de la estimación. _Media_: todo lo demás. Solo califica la
coherencia interna, no la exactitud.

## Reglas de la Fase 2

**Aplicabilidad.** Un criterio se aplica salvo que enumere tipos (`hardware`, `software`, `process`)
que excluyan el tipo del CTE. Un CTE sin tipo definido recibe todos los criterios.

**Satisfecho.** Estado **Cumplido** con al menos una evidencia vinculada no marcada como
_Rechazado_, o estado **N/A** con una justificación no vacía. Nada más se considera satisfecho,
incluido _Cumplido_ sin evidencias utilizables.

:::figure evidence-decision:::

**Nivel alcanzado.** Todos los criterios _obligatorios_ aplicables en L están satisfechos **y** el
nivel L−1 está alcanzado (el nivel 0 siempre cuenta). Un nivel por encima de uno no alcanzado se
muestra como _bloqueado_.

Un nivel **sin** criterios obligatorios aplicables se alcanza cuando al menos un criterio aplicable
está satisfecho, y se marca con «Sin criterios obligatorios — requiere confirmación del evaluador»:
es el caso de todos los niveles de `dod-tra-2025`, que no marca nada como obligatorio.

**TRL del CTE.** El nivel alcanzado más alto; 0 se muestra como «< TRL 1».

**Completitud del siguiente nivel.** En el nivel superior: criterios aplicables satisfechos ÷
criterios aplicables, excluyendo N/A en ambos casos.

**Resumen del sistema.** El TRL **mínimo** de los CTE marcados como _críticos_, indicando el CTE o
los CTE limitantes; no se calcula si ningún CTE es crítico.

**Cobertura de evidencias.** Por CTE: criterios _Cumplidos_ con al menos una evidencia no rechazada
÷ criterios _Cumplidos_.

**Diferencia entre fases.** Resumen de la Fase 2 menos la estimación de la Fase 1; se explica
cuando es de 2 o más.

El tipo de evidencia nunca se pondera; solo las evidencias _Rechazadas_ modifican la puntuación.

## Ejemplo resuelto 1 — una Fase 1 sin incidencias

Sí en TRL 1–4, Sin certeza en 5, No por encima. Construcción B2, entorno E2.

:::figure tier1-clean:::

## Ejemplo resuelto 2 — una alerta de brecha

Sí en 1, No en 2, Sí en 3 y 4, No por encima. Construcción B1, entorno E1 (comprobación cruzada 3).

:::figure tier1-gap:::

La coherencia es **Media**: una brecha de un nivel.

## Ejemplo resuelto 3 — un CTE limita el sistema

Un nodo sensor remoto con tres CTE críticos.

:::figure tier2-system:::

Dos CTE no han alcanzado TRL 4, por lo que ambos se indican como limitantes; la lista de brechas
muestra lo que aún necesita cada uno.
