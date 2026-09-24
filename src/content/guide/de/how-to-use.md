# So verwenden Sie dieses Tool

Alles läuft in Ihrem Browser. Nichts wird hochgeladen, und es gibt kein Konto.

## Tier 1 — Schnelleinschätzung (etwa 5 Minuten)

1. **Kontext.** Projekt, Technologie und Bewerter sowie _erreichte Umgebung_ (E0–E4) und
   _Aufbaureife_ (B0–B5), die in die Gegenprüfung einfließen.
2. **Neun Fragen, beginnend mit TRL 9.** Antworten Sie **Ja**, **Nein** oder **Unsicher** für die
   Technologie als Ganzes. Tastatur: `Y` `N` `U` zum Antworten, Pfeiltasten zum Navigieren.
3. **Ergebnis.** Geschätzter TRL, höchste beanspruchte Stufe, Gegenprüfung, Konsistenzbewertung
   und Warnhinweise. Laden Sie die Arbeitsmappe oder die JSON-Datei herunter.

## Tier 2 — Nachweisbasierte Bewertung

1. **Bestimmen Sie die CTEs** — siehe [Kritische Technologieelemente](/guide/cte). Kennzeichnen
   Sie diejenigen als kritisch, die in die Systemzusammenfassung eingehen sollen.
2. **Bewerten Sie die Kriterien** für jedes CTE, aufsteigend ab TRL 1:

:::figure status-legend:::

3. **Hängen Sie Nachweise an** über **Verwalten** neben einem Kriterium. Ein verpflichtendes
   Kriterium, das als _Erfüllt_ markiert ist, zählt ohne Nachweis **nicht**. Siehe
   [Nachweise](/guide/evidence).
4. **Lesen Sie die Ergebnisse:** den TRL jedes CTE, die Systemzusammenfassung, das begrenzende CTE
   und die Lückenliste.
5. **Exportieren Sie.** Die Arbeitsmappe ist die Dokumentation; das Nachweispaket (.zip) enthält
   zusätzlich die Dateien mit einem SHA-256-Manifest.

## Einführungsreife — ARL

1. **Umfang.** Projekt, Technologieumfang, Umfang der Wertschöpfungskette, Zeithorizont und
   politisches Umfeld.
2. **Stufen Sie** jede der 17 Dimensionen mit einer Begründung **ein**, und setzen Sie Ziele zum
   Projektende, wo das Projekt ein Risiko verringern wird.
3. **Ergebnis.** ARL Beginn, ARL Ende und das Risikoprofil. Laden Sie die ARL-Arbeitsmappe oder die
   JSON-Datei herunter.

_ARL zurücksetzen_ löscht nur die ARL-Einstufungen. Siehe [Einführungsreife](/guide/arl).

## Speichern, Weitergeben, Löschen

|                  |                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Autospeicherung  | In diesem Browser: `localStorage` für die Bewertung, IndexedDB für Nachweisdateien. Das Löschen der Websitedaten entfernt sie. |
| Übergabe         | **JSON herunterladen** / **JSON importieren** übertragen alles außer den Dateiinhalten; das Nachweispaket enthält die Dateien. |
| Synchronisierung | Keine. Verschiedene Browser, Profile und Geräte teilen keinen Speicher.                                                        |
| Löschen          | **Alle lokalen Daten löschen** entfernt die Sitzung und jede gespeicherte Datei aus diesem Browser. Exportieren Sie vorher.    |
