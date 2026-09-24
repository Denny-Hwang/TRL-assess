# Nachweise

Ein verpflichtendes Kriterium, das als _Erfüllt_ markiert ist, zählt ohne verwendbaren Nachweis
**nicht**.

:::figure evidence-decision:::

## Was zählt

Alles, was ein Prüfer untersuchen könnte, ohne Sie zu fragen.

| Typ                    | Stark                                                                                    | Schwach                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Dokument               | Ein unterzeichneter Prüfbericht mit Angabe von Prüfling, Bedingungen, Datum und Bediener | Undatierte Prüfnotizen ohne Verfasser                           |
| Testdaten              | Eine Datendatei samt Bedingungen und Abnahmekriterien                                    | Ein Screenshot eines Diagramms mit unbeschrifteten Achsen       |
| Code-Repository        | Eine URL **plus ein festgelegter Commit-SHA**, Pfad und Tag                              | Ein Link auf `main`                                             |
| Zeichnung/CAD          | Eine freigegebene Zeichnung, deren Revision zum getesteten Prüfling passt                | Eine unbenannte Skizze auf einer Folie                          |
| Foto/Video             | Ein datiertes Foto des Prüflings im Test, mit Maßstab                                    | Ein Rendering                                                   |
| Veröffentlichung (DOI) | Eine DOI, die die Aussage tatsächlich abdeckt                                            | Eine DOI zu einem verwandten, aber anderen Gerät                |
| Weblink                | Eine stabile öffentliche Seite — Einrichtung, Norm, Datensatz                            | Eine URL mit Suchergebnissen oder eine Seite hinter einem Login |
| Sonstiges              | Ein Kalibrierzertifikat, ein Auditprotokoll                                              | „Siehe Gruppenlaufwerk“                                         |

Erfassen Sie Prüfling und Revision, Datum, Bediener, Bedingungen, Abnahmekriterien und Ergebnisse —
einschließlich Fehlschlägen. Ein Repository-Link benötigt einen Commit-SHA mit 7–40 Zeichen und
einen Pfad.

## Relevante Umgebung und Einsatzumgebung

Diese Unterscheidung trennt TRL 5/6 von 7/8.

:::figure environment-fidelity:::

- Eine **relevante Umgebung** ist „a set of stressing conditions, representative of the full
  spectrum of intended operational employments“ (Übersetzung: „eine Reihe belastender Bedingungen,
  repräsentativ für das volle Spektrum der vorgesehenen Einsatzarten“), angewendet auf das Element
  als Teil einer Komponente (TRL 5) oder eines Systems/Teilsystems (TRL 6) — `dod-tra-2025`, S. 12.
- Eine **Einsatzumgebung** ist „a set of conditions, representative of the full spectrum of
  employments“ (Übersetzung: „eine Reihe von Bedingungen, repräsentativ für das volle Spektrum der
  Einsatzarten“), angewendet auf einen Prototyp (TRL 7) oder das tatsächliche System (TRL 8) —
  `dod-tra-2025`, S. 13.

„Full spectrum“ (volles Spektrum) bedeutet: Ein einzelner günstiger Test reicht nicht aus.

## Kennzeichnungen

_Öffentlich_, _Intern (uneingeschränkt)_ oder **Sensibel — nur Verweis**; bei Letzterem **weigert
sich das Tool, eine Datei zu speichern**: Erfassen Sie stattdessen Titel, Verwahrer und eine
Referenznummer. Geben Sie niemals eingestufte, exportkontrollierte oder CUI-Inhalte ein.

## Verifizierung

Jeder Eintrag ist **Nicht verifiziert**, **Verifiziert** oder **Abgelehnt**, mit Verifizierer und
Datum. Nur _Abgelehnt_ wirkt sich auf die Bewertung aus: Abgelehnte Nachweise werden
ausgeschlossen, sodass ein Kriterium, das sich nur auf sie stützt, nicht mehr als anerkannt gilt.
