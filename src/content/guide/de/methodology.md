# Methodik

Nichts wird gewichtet, und nichts wird abgeleitet.

## Regeln für Tier 1

| Regel                               | Was sie bewirkt                                                                                                                  |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Geschätzter TRL** (der Hauptwert) | Die höchste Stufe L, bei der L _und jede Stufe darunter_ mit „Ja“ beantwortet wurden. Ist TRL 1 nicht „Ja“, lautet er „< TRL 1“. |
| **Höchste beanspruchte Stufe**      | Das höchste einzelne „Ja“, Lücken unberücksichtigt.                                                                              |
| **„Unsicher“ zählt nie als „Ja“**   | Ebenso wenig „Nein“. Ein „Unsicher“ bei TRL 3 begrenzt die Schätzung auf TRL 2.                                                  |
| **Lücken-Warnhinweis**              | Wird ausgelöst, wenn die höchste Angabe über der Schätzung liegt; er nennt die nicht bestätigten Stufen.                         |
| **Unsicher-Warnhinweis**            | Wird ausgelöst, wenn eine Antwort auf oder unter der höchsten Angabe „Unsicher“ lautet.                                          |

**Gegenprüfung.** Aufbaureife (B0–B5) × Umgebung (E0–E4) ergibt einen vorgeschlagenen TRL. Das ist
eine Heuristik dieses Tools, kein Standard, und fließt nur in die Konsistenzbewertung ein.

:::figure cross-check-matrix:::

**Konsistenzbewertung.** _Niedrig_: Die Gegenprüfung weicht um 3 oder mehr von der Schätzung ab,
oder eine Lücke umfasst 2 oder mehr Stufen. _Hoch_: kein Lücken- oder Unsicher-Warnhinweis, und die
Gegenprüfung liegt höchstens 1 von der Schätzung entfernt. _Mittel_: alles andere. Bewertet wird
nur die innere Stimmigkeit, nicht die Richtigkeit.

## Regeln für Tier 2

**Anwendbarkeit.** Ein Kriterium gilt, sofern es keine Arten (`hardware`, `software`, `process`)
aufführt, die die Art des CTE ausschließen. Ein CTE ohne festgelegte Art erhält jedes Kriterium.

**Anerkannt.** Status **Erfüllt** mit mindestens einem verknüpften Nachweis, der nicht als
_Abgelehnt_ markiert ist, oder Status **N/A** mit einer nicht leeren Begründung. Nichts anderes
gilt als anerkannt — auch nicht _Erfüllt_ ohne verwendbaren Nachweis.

:::figure evidence-decision:::

**Erreichte Stufe.** Jedes anwendbare _verpflichtende_ Kriterium auf Stufe L ist anerkannt **und**
Stufe L−1 ist erreicht (Stufe 0 zählt immer). Eine Stufe über einer nicht erreichten wird als
_gesperrt_ angezeigt.

Eine Stufe **ohne** anwendbare verpflichtende Kriterien ist erreicht, wenn mindestens ein
anwendbares Kriterium anerkannt ist, und erhält den Warnhinweis „Keine verpflichtenden Kriterien —
Bestätigung durch den Bewerter erforderlich“ — das betrifft jede Stufe in `dod-tra-2025`, das
nichts als verpflichtend kennzeichnet.

**TRL eines CTE.** Die höchste erreichte Stufe; 0 wird als „< TRL 1“ angezeigt.

**Vollständigkeit der nächsten Stufe.** Auf der Stufe darüber: anerkannte anwendbare Kriterien ÷
anwendbare Kriterien, jeweils ohne N/A.

**Systemzusammenfassung.** Der **niedrigste** TRL unter den als _kritisch_ gekennzeichneten CTEs,
mit Nennung des oder der begrenzenden CTEs; wird nicht berechnet, wenn kein CTE kritisch ist.

**Nachweisabdeckung.** Je CTE: _Erfüllte_ Kriterien mit mindestens einem nicht abgelehnten
Nachweis ÷ _erfüllte_ Kriterien.

**Differenz zwischen den Tiers.** Zusammenfassung aus Tier 2 minus Schätzung aus Tier 1; ab einem
Wert von 2 wird sie erläutert.

Der Typ eines Nachweises wird nie gewichtet; nur _abgelehnte_ Nachweise verändern das Ergebnis.

## Rechenbeispiel 1 — ein sauberes Tier 1

Ja bei TRL 1–4, Unsicher bei 5, Nein darüber. Aufbau B2, Umgebung E2.

:::figure tier1-clean:::

## Rechenbeispiel 2 — ein Lücken-Warnhinweis

Ja bei 1, Nein bei 2, Ja bei 3 und 4, Nein darüber. Aufbau B1, Umgebung E1 (Gegenprüfung 3).

:::figure tier1-gap:::

Die Konsistenz ist **Mittel**: eine Lücke von einer Stufe.

## Rechenbeispiel 3 — ein CTE begrenzt das System

Ein Fernsensorknoten mit drei kritischen CTEs.

:::figure tier2-system:::

Zwei CTEs haben TRL 4 nicht erreicht, daher werden beide als begrenzend genannt; die Lückenliste
zeigt, was jedem noch fehlt.
