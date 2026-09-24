# Kritische Technologieelemente

Ein CTE ist ein Teil des Systems, dessen Reife darüber entscheidet, ob das System funktioniert.
Bewerten Sie CTEs, nicht Produkte: „Der Knoten ist TRL 6“ ist eine Zusammenfassung; „der
Energy-Harvester ist TRL 4“ ist eine Bewertung.

:::figure cte-tree:::

## Fünf Fragen, die ein CTE aufspüren

Ein „Ja“ auf eine dieser Fragen bedeutet meist, dass Sie eines gefunden haben:

1. **Ist es neu oder wird es neu eingesetzt** — in einer neuen Umgebung, auf neue Weise oder in
   neuem Maßstab?
2. **Hängt die Leistung davon ab?** Scheitert die Mission, wenn es hinter den Erwartungen
   zurückbleibt?
3. **Besteht echte Unsicherheit, ob es funktionieren wird?** Keine Demonstration bedeutet geringe
   Reife.
4. **Würde ein sachkundiger Prüfer zuerst danach fragen?**
5. **Liegt es auf dem kritischen Pfad zum nächsten Meilenstein?**

Meist **keine** CTEs: Katalogteile, die innerhalb ihrer Nennwerte betrieben werden, Bibliotheken,
die bestimmungsgemäß verwendet werden, und alles, was in derselben Umgebung bereits erprobt ist.

## Das Beispiel

Die Beispielsitzung enthält drei CTEs: Energy-Harvester, Energiemanagementmodul und
Telemetrie-Firmware. Auch ein Verfahren, etwa die Installation, kann ein CTE sein (Art _Prozess_).

## Häufige Fehler

| Fehler                              | Abhilfe                                                                                  |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| Ein CTE für das ganze System        | Teilen Sie dort auf, wo Teilsysteme sichtbar unterschiedlich weit sind.                  |
| Ein CTE je Platine oder Bauteil     | Führen Sie Elemente zusammen, die immer denselben Status und dieselben Nachweise hätten. |
| Alles als kritisch gekennzeichnet   | Kennzeichnen Sie nur, was die Mission bestimmt; die Zusammenfassung ist das Minimum.     |
| Nichts als kritisch gekennzeichnet  | Kennzeichnen Sie mindestens eines, sonst wird keine Systemzusammenfassung berechnet.     |
| „Kritisch“ als „wichtig“ verstanden | Ein wichtiges Teil ist nur dann ein CTE, wenn etwas daran noch nicht erprobt ist.        |

Drei bis acht CTEs sind für ein Projekt im Maßstab eines Geräts meist richtig.
