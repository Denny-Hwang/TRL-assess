# Häufig gestellte Fragen

## Ist das ein offizielles Technology Readiness Assessment?

Nein. Ein TRA wird von einem unabhängigen Team nach dem Verfahren einer Behörde durchgeführt.
Dieses Tool erfasst, was Sie eingeben, und wendet die Regeln konservativ an. Jedes Ergebnis und
jeder Export weist darauf hin.

## Verändert das ARL-Modul meinen TRL?

Nein. Der ARL wird getrennt bewertet und nie mit einem TRL zusammengefasst. Siehe
[Einführungsreife](/guide/arl).

## Kann ich das Ergebnis in einem Antrag verwenden?

Als Ihre eigene Aussage zur Reife, unter Angabe von Framework, Version und Nachweisen. Stellen Sie
es nicht als unabhängig dar. Wenn eine Ausschreibung eigene TRL-Definitionen vorgibt, verwenden Sie
diese.

## Warum ist mein Ergebnis in Tier 2 niedriger als meine Schätzung in Tier 1?

Tier 2 verlangt einen Nachweis für jede Aussage und für eine Stufe alle verpflichtenden Kriterien,
und es übernimmt das _Minimum_ über die kritischen CTEs. Sehen Sie sich zuerst das begrenzende CTE
an.

## Warum zählt „Unsicher“ wie „Nein“?

Ein Reifegrad behauptet, dass etwas demonstriert wurde. Wenn Sie unsicher sind, ob es das wurde,
können Sie es nicht beanspruchen.

## Was, wenn ein Kriterium nicht zutrifft?

Markieren Sie es mit Begründung als **N/A** — das gilt als anerkannt. Ein N/A ohne Begründung
nicht.

## Warum steht bei meiner Stufe „Keine verpflichtenden Kriterien — Bestätigung durch den Bewerter erforderlich“?

Die Quelle des Frameworks klassifiziert Kriterien nicht als verpflichtend, daher ist die Stufe
erreicht, sobald ein anwendbares Kriterium anerkannt ist, und Sie müssen das bestätigen. Siehe
[Frameworks](/guide/frameworks).

## Wo sind meine Daten?

Nur in diesem Browser: die Bewertung in `localStorage`, Nachweisdateien in IndexedDB. Die App stellt
keine Netzwerkanfragen. Verschiedene Browser und Geräte teilen keinen Speicher.

## Was passiert, wenn ich meine Browserdaten lösche?

Die Bewertung und jede gespeicherte Datei sind verloren. Exportieren Sie vorher die JSON-Datei oder
das Nachweispaket.

## Kann ich das Nachweispaket weitergeben?

Ja. Einträge mit der Kennzeichnung „Sensibel — nur Verweis“ werden nie hineingepackt; alles andere
schon, behandeln Sie die `.zip` also als genauso sensibel wie ihren Inhalt. Mit dem Manifest kann
ein Empfänger prüfen, dass nichts verändert wurde.

## Warum kann ich einem Eintrag mit „Sensibel — nur Verweis“ keine Datei anhängen?

Damit kontrolliertes Material nicht in das Tool gelangt. Erfassen Sie stattdessen Titel, Verwahrer
und eine Referenznummer.

## Kann ich die Arbeitsmappe bearbeiten und erneut importieren?

Nein. Arbeitsmappen sind statische Momentaufnahmen; importieren Sie stattdessen die Sitzungs-JSON
erneut.

## Kann ich ein Kriterium korrigieren oder ein Framework hinzufügen?

Frameworks sind JSON-Daten. Eröffnen Sie ein Issue **Criteria correction** mit der Quelle und der
Seitenangabe; siehe `CONTRIBUTING.md`.
