# Frameworks & Quellen

Ein TRL sagt wenig aus ohne das Framework, nach dem er bewertet wurde. Wählen Sie das Framework zu
Beginn einer Sitzung; jeder Export hält seine ID und Version fest.

:::figure framework-relation:::

## `dod-tra-2025` — die Voreinstellung

**Geltungsbereich.** Jedes Hardware-, Software- oder Prozesselement.

**Inhalt.** Kriterien, **wörtlich** übernommen aus dem DoD Technology Readiness Assessment
Guidebook (Februar 2025): Table 2-1 für Hardware (S. 6–7), Table 2-2 für Software (S. 8–10) und die
Kriterien für relevante Umgebung und Einsatzumgebung in Section 2 (S. 12–13). Die Fragen von Tier 1
formulieren diese Definitionen als Fragen um (`adapted`).

**Zwei Dinge sollten Sie wissen:**

1. **Nichts ist verpflichtend.** Das Guidebook klassifiziert keine Kriterien, daher erhält jede
   Stufe den Warnhinweis „Keine verpflichtenden Kriterien — Bestätigung durch den Bewerter
   erforderlich“ und ist erreicht, sobald ein anwendbares Kriterium anerkannt ist. Urteilen Sie
   selbst, was die Stufe erfordert.
2. **CTEs der Art `process` werden die Hardwarekriterien angeboten**, da das Guidebook nur Hardware
   und Software abdeckt. Diese Zuordnung ist eine Entscheidung dieses Tools.

## `marine-energy-eere` — Meeresenergie und Ozeangeräte

**Geltungsbereich.** Meeresenergiewandler, Geräte zur Ozeanbeobachtung und ihre Teilsysteme.

**Tier 1.** Neun Fragen, angepasst aus den TRL-Definitionen des DOE EERE (`eere-r540-112-02`).
Dieses Dokument definiert nur TRL 1–8, daher stammt die Frage zu TRL 9 aus `dod-tra-2025`,
Table 2-1.

**Tier 2.** Die Kriterien aus `dod-tra-2025`, wobei das stufendefinierende Kriterium jeder TRL
verpflichtend gemacht wurde, plus acht **zugeschnittene** Einträge, alle verpflichtend: ein
Risikoregister und eine FMECA (TRL 4); Tests in leitfähigem Meerwasser und unter
Umweltextremen (5); ein Testplan, der Hafenbecken und offenes Wasser trennt, sowie protokollierte
Einsatzdauer und Ausfälle im Feld (6); für die Serie vorgesehene Teile sowie ein dokumentiertes
Kalibrierverfahren und ein dokumentierter Datenpfad (7); ein erprobter Weg zur Datenübermittlung an
das Beobachtungsprogramm (8). Trifft einer davon nicht zu, markieren Sie ihn mit Begründung als
_N/A_.

Die Begründungen der zugeschnittenen Einträge zitieren das Risiko-Framework des NREL für
Meeresenergie (`nrel-me-risk`) und das GOOS Framework for Ocean Observing (`goos-foo`); aus beiden
wird kein Text wiedergegeben.

## `doe-otc-arl-2025` — Einführungsreife

Kein TRL-Framework. Das _Adoption Readiness Assessment_ des DOE (Version: April 2025): 17
Einführungsrisiko-Dimensionen und die Nachschlagetabelle, die daraus einen ARL macht, **wörtlich**
übernommen. Wird getrennt bewertet und nie mit einem TRL zusammengefasst; siehe
[Einführungsreife](/guide/arl).

## Herkunft

| `origin`   | Bedeutung                                              |
| ---------- | ------------------------------------------------------ |
| `verbatim` | Exakt aus einer gemeinfreien Quelle übernommen         |
| `adapted`  | Wortlaut der Quelle umstrukturiert, Bedeutung erhalten |
| `tailored` | In keiner Quelle enthalten; vom Framework ergänzt      |

Einträge mit `adapted` und `tailored` tragen eine Begründung. ISO 16290:2013 wird nur mit
Abschnittsnummer zitiert; sein Text wird nie wiedergegeben.

Wenn ein Kriterium seine Quelle falsch zitiert, eröffnen Sie ein Issue **Criteria correction** mit
der Framework-ID, der Eintrags-ID, dem Wortlaut der Quelle und der Seitenangabe.
