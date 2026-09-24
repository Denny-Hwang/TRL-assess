# Phasen-Zuordnung

> **Ein Referenzmodell, keine offizielle Norm.** Phasenmodelle sind organisationsspezifisch. Nutzen
> Sie sie zur Verständigung, nicht als Grundlage für die TRL-Bewertung.

Hier wird ein verbreitetes Phasenmodell der Hardwareentwicklung auf den TRL abgebildet.

:::figure stage-crosswalk:::

| Phase | Entwicklungsbegriff                     | Typischer TRL | Hauptziel                                                                                         |
| ----- | --------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| 0     | Konzept                                 | 1–2           | Die Chance und einen technisch glaubwürdigen Ansatz definieren.                                   |
| 1     | Bewertung auf Komponentenebene          | 2–3           | Schlüsselkomponenten auswählen; Grenzen, Streuung und Integrationsrisiko verstehen.               |
| 2     | Machbarkeitsnachweis (Proof of Concept) | 3             | Die grundlegende technische Machbarkeit demonstrieren.                                            |
| 3     | Breadboard-Prototyp                     | 3–4           | Signalkette, Elektronik, Algorithmen, Firmware und Methode entwickeln.                            |
| 4     | Prototyp auf Platinenebene (PCB)        | 4             | Eigene Elektronik, Layout, Rauschen, Stromversorgung und Schnittstellen validieren.               |
| 5     | Integrierter Prototyp                   | 5             | Die Ende-zu-Ende-Funktion unter repräsentativen Bedingungen validieren.                           |
| 6     | Miniaturisierter Prototyp               | 5–6           | Formfaktor, Gewicht, thermisches Verhalten, Gehäuse und Gebrauchstauglichkeit validieren.         |
| 7     | Serienreifer Prototyp                   | 6–7           | Designvalidierung, Zuverlässigkeit sowie regulatorische und Fertigungsreife unterstützen.         |
| 8     | Pilotserie                              | 7–8           | Herstellbarkeit, Ausbeute, Kalibrierung, Endprüfung und Lieferkette verifizieren.                 |
| 9     | Technologietransfer / Lizenzierung      | 8–9           | Einen Partner befähigen, das Produkt zu qualifizieren, zu fertigen, zu verkaufen und zu betreuen. |

## Warum die Bereiche so breit sind

Eine Phase sagt, was Sie **gebaut** haben; ein TRL sagt, was Sie **demonstriert haben, und wo**.
Ein miniaturisierter Prototyp, der nur auf dem Labortisch getestet wurde, ist TRL 4; in einer
relevanten Umgebung 5; in das System integriert und dort demonstriert 6. Die Phasen 8–9 betreffen
überwiegend Fertigungs- und kommerzielle Fragen, die der TRL nicht misst.
