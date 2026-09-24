# Correspondencia de etapas

> **Un modelo de referencia, no una norma oficial.** Los modelos de etapas son específicos de cada
> organización. Sirven para comunicar, no como base para puntuar el TRL.

Aquí se hace corresponder un modelo habitual de etapas de desarrollo de hardware con el TRL.

:::figure stage-crosswalk:::

| Etapa | Término de desarrollo                  | TRL típico | Objetivo principal                                                                                                              |
| ----- | -------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 0     | Concepto                               | 1–2        | Definir la oportunidad y un enfoque técnicamente creíble.                                                                       |
| 1     | Evaluación a nivel de componente       | 2–3        | Seleccionar los componentes clave; comprender sus límites, su variabilidad y el riesgo de integración.                          |
| 2     | Prueba de concepto                     | 3          | Demostrar la viabilidad técnica fundamental.                                                                                    |
| 3     | Prototipo en placa de pruebas          | 3–4        | Desarrollar la cadena de señal, la electrónica, los algoritmos, el firmware y el método.                                        |
| 4     | Prototipo a nivel de placa (PCB)       | 4          | Validar la electrónica a medida, el diseño de la placa, el ruido, la alimentación y las interfaces.                             |
| 5     | Prototipo integrado                    | 5          | Validar el funcionamiento de extremo a extremo en condiciones representativas.                                                  |
| 6     | Prototipo miniaturizado                | 5–6        | Validar el factor de forma, el peso, el comportamiento térmico, el encapsulado y la usabilidad.                                 |
| 7     | Prototipo orientado a producción       | 6–7        | Respaldar la validación del diseño, la fiabilidad y la preparación regulatoria y de fabricación.                                |
| 8     | Fabricación piloto                     | 7–8        | Verificar la fabricabilidad, el rendimiento de producción, la calibración, el ensayo de fin de línea y la cadena de suministro. |
| 9     | Transferencia de tecnología / licencia | 8–9        | Permitir que un socio cualifique, fabrique, venda y dé soporte al producto.                                                     |

## Por qué los rangos son amplios

Una etapa indica lo que se ha **construido**; un TRL indica lo que se ha **demostrado, y dónde**. Un
prototipo miniaturizado ensayado solo en banco está en TRL 4; en un entorno relevante, en 5;
integrado en el sistema y demostrado allí, en 6. Las etapas 8–9 son sobre todo cuestiones de
fabricación y comerciales, que el TRL no mide.
