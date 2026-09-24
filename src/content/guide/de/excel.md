# Excel-Ausgabe

Arbeitsmappen sind statische Momentaufnahmen. Sie lassen sich in Microsoft Excel und LibreOffice
öffnen und enthalten Datenüberprüfung und bedingte Formatierung.

## Die beiden Arbeitsmappen

:::figure sheet-map:::

- **`Criteria_Assessment`** — eine Zeile je CTE × Kriterium, mit der berechneten Spalte
  _Anerkannt_.
- **`Evidence_Register`** — jeder Nachweis, danach 50 leere Zeilen (`EV-P001`…), die bereits die
  Auswahllisten und die Formel _Öffnen_ enthalten.
- **`Gap_Actions`** — die nicht erfüllten verpflichtenden Kriterien auf der nächsten Stufe jedes
  CTE, plus 20 leere Zeilen.

## Arbeitsmappe zur Einführungsreife

Das [ARL-Modul](/guide/arl) exportiert `ARL_<project>_<timestamp>.xlsx` mit den Blättern `README`,
`Summary`, `Scope`, `Risk_Assessment` (eine Zeile je Dimension, mit dem Text des
Bewertungsrasters), `ARL_Lookup` (Zellen für Beginn und Ziel markiert), `References` und
`Metadata`.

## Nachweise in Excel hinzufügen

Tragen Sie in `Evidence_Register` entweder

1. **eine URL** unter _Speicherort / URL_ ein — _Öffnen_ wird zu „Open link“;
2. **einen Pfad relativ zur Arbeitsmappe** unter _Lokale Datei (relativer Pfad)_ ein, wobei die
   Datei in einem Ordner `evidence/` daneben liegt — _Öffnen_ wird zu „Open file“; oder
3. setzen Sie _Kennzeichnung_ auf „Sensitive — reference only“ und erfassen Sie den Verwahrer und
   eine Referenznummer.

Damit relative Links funktionieren, **entpacken Sie das gesamte Paket, bevor Sie die Arbeitsmappe
öffnen**, und verschieben Sie den Ordner, nicht die Arbeitsmappe allein.

## Werte werden nicht neu berechnet

Jeder berechnete Wert — Anerkannt, die TRLs der CTEs, die Zusammenfassung, Vollständigkeit,
Abdeckung, der ARL — ist ein **statischer Wert**, der beim Export geschrieben wird. Ändern Sie einen
Status in Excel, ändert sich sonst nichts. Ändern Sie die Bewertung in der App (oder importieren Sie
die Sitzungs-JSON erneut) und exportieren Sie noch einmal.

Text, der mit `=`, `+`, `-` oder `@` beginnt, wird mit einem vorangestellten Apostroph geschrieben,
damit er nicht als Formel ausgeführt werden kann.
