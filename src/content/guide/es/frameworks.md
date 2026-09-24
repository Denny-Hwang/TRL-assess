# Marcos y fuentes

Un TRL significa poco sin el marco con el que se puntuó. El marco se elige al iniciar una sesión;
cada exportación registra su id y su versión.

:::figure framework-relation:::

## `dod-tra-2025` — el predeterminado

**Alcance.** Cualquier elemento de hardware, software o proceso.

**Contenido.** Criterios transcritos **literalmente** de la DoD Technology Readiness Assessment
Guidebook (February 2025): Table 2-1 para hardware (pp. 6–7), Table 2-2 para software (pp. 8–10) y
los criterios de entorno relevante/operativo de la Section 2 (pp. 12–13). Las preguntas de la
Fase 1 reformulan esas definiciones como preguntas (`adapted`).

**Dos cosas que conviene saber:**

1. **Nada es obligatorio.** La guía no clasifica los criterios, por lo que cada nivel se marca con
   «Sin criterios obligatorios — requiere confirmación del evaluador» y se alcanza en cuanto se
   satisface un criterio aplicable. Aplicar el propio criterio profesional para decidir qué necesita
   el nivel.
2. **A los CTE de tipo `process` se les ofrecen los criterios de hardware**, ya que la guía solo
   cubre hardware y software. Esa correspondencia es una decisión de esta herramienta.

## `marine-energy-eere` — energía marina y dispositivos oceánicos

**Alcance.** Convertidores de energía marina, dispositivos de observación oceánica y sus
subsistemas.

**Fase 1.** Nueve preguntas adaptadas de las definiciones TRL del DOE EERE (`eere-r540-112-02`). Ese
documento solo define TRL 1–8, por lo que la pregunta de TRL 9 procede de `dod-tra-2025`,
Table 2-1.

**Fase 2.** Los criterios de `dod-tra-2025`, con el criterio que define cada TRL marcado como
obligatorio, más ocho elementos **a medida**, todos obligatorios: un registro de riesgos y un FMECA
(TRL 4); ensayos en agua de mar conductora y en condiciones ambientales extremas (5); un plan de
ensayos que distinga entre muelle y mar abierto, y la duración y los fallos en campo registrados (6);
piezas destinadas a producción, y un procedimiento de calibración y una ruta de datos documentados
(7); una vía de envío de datos al programa de observación ya ejercitada (8). Si alguno no aplica,
marcarlo como _N/A_ con una justificación.

Las justificaciones de los elementos a medida citan el marco de riesgos de energía marina del NREL
(`nrel-me-risk`) y el GOOS Framework for Ocean Observing (`goos-foo`); no se reproduce ningún texto
de ellos.

## `doe-otc-arl-2025` — preparación para la adopción

No es un marco TRL. La _Adoption Readiness Assessment_ del DOE (Version: April 2025): 17 dimensiones
de riesgo de adopción y la tabla de consulta que las convierte en un ARL, transcritas
**literalmente**. Se puntúa por separado y nunca se combina con un TRL; véase
[Preparación para la adopción (ARL)](/guide/arl).

## Procedencia

| `origin`              | Significado                                                   |
| --------------------- | ------------------------------------------------------------- |
| `verbatim` (literal)  | Copiado exactamente de una fuente de dominio público          |
| `adapted` (adaptado)  | Redacción de la fuente reestructurada; se conserva el sentido |
| `tailored` (a medida) | No figura en ninguna fuente; añadido por el marco             |

Los elementos `adapted` y `tailored` llevan una justificación. La norma ISO 16290:2013 se cita solo
por número de apartado; su texto nunca se reproduce.

Si un criterio cita mal su fuente, abrir una incidencia **Criteria correction** con el id del marco,
el id del elemento, lo que dice la fuente y la referencia de página.
