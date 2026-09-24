# Qué es un Nivel de madurez tecnológica

Un TRL es un número del 1 al 9 que responde a una sola pregunta: **¿hasta qué punto se ha demostrado
esta tecnología, y en qué entorno?** No mide la calidad, el valor de mercado ni lo bien que se
gestiona el proyecto.

:::figure trl-scale:::

## Los nueve niveles

Las definiciones siguientes son las definiciones de hardware del DoD (`dod-tra-2025`, Table 2-1,
pp. 6–7) y se reproducen en inglés, tal como las publica la fuente, con una traducción no oficial
entre paréntesis. Cada marco muestra su propia definición en el texto de ayuda de cada pregunta.

| TRL | Definición                                                                                                                                                                                 | Entorno               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| 1   | Basic principles observed and reported (traducción: «principios básicos observados y comunicados»)                                                                                         | —                     |
| 2   | Technology concept and/or application formulated (traducción: «concepto tecnológico y/o aplicación formulados»)                                                                            | análisis              |
| 3   | Analytical and experimental critical function and/or characteristic proof of concept (traducción: «prueba de concepto analítica y experimental de funciones críticas y/o características») | laboratorio           |
| 4   | Component and/or breadboard validation in a laboratory environment (traducción: «validación de componentes y/o placa de pruebas en un entorno de laboratorio»)                             | laboratorio           |
| 5   | Component and/or breadboard validation in a relevant environment (traducción: «validación de componentes y/o placa de pruebas en un entorno relevante»)                                    | relevante             |
| 6   | System/subsystem model or prototype demonstration in a relevant environment (traducción: «demostración de un modelo o prototipo de sistema/subsistema en un entorno relevante»)            | relevante             |
| 7   | System prototype demonstration in an operational environment (traducción: «demostración de un prototipo del sistema en un entorno operativo»)                                              | operativo             |
| 8   | Actual system completed and qualified through test and demonstration (traducción: «sistema real completado y cualificado mediante ensayos y demostraciones»)                               | condiciones previstas |
| 9   | Actual system proven through successful mission operations (traducción: «sistema real probado mediante operaciones de misión satisfactorias»)                                              | condiciones de misión |

El nivel lo decide _qué_ se ensayó y _dónde_.

## Un TRL necesita su marco

Las agencias comparten a grandes rasgos las nueve definiciones, pero no los criterios para declarar
un nivel. «TRL 6» en un marco no es la misma afirmación que «TRL 6» en otro, por lo que cada
exportación registra el id y la versión del marco. Véase [Marcos y fuentes](/guide/frameworks).

## El papel de esta herramienta

Una ayuda a la autoevaluación en dos fases: una **estimación rápida** en pocos minutos y sin
documentos, y una **evaluación basada en evidencias** en la que cada afirmación se vincula a un
documento, un registro de ensayo, un commit fijado o un DOI.

**No** es una Evaluación de madurez tecnológica (TRA) independiente. Una TRA la realiza un equipo
independiente del programa, que puede rechazar las evidencias presentadas. Esta herramienta registra
lo que se introduce y aplica las reglas de forma conservadora. Sirve para preparar una TRA o para
detectar pronto las evidencias que faltan.
