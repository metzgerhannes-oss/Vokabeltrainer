# Change Brief – Vokabeltrainer

Diese Vorlage wird für nichttriviale Produkt-, Lernlogik-, Daten- oder UI-Änderungen verwendet.

## Identität

- Change-ID / PR:
- Datum:
- Status: `IDEA | REVIEWED | APPROVED_BACKLOG | IN_IMPLEMENTATION | IMPLEMENTED | VERIFIED | PRODUCTION | LIVE VERIFIED`
- Baseline (`main` SHA):
- App-Version:
- Betroffene Decision-ID(s):
- Kanonische Quelle(n):

## Problem / Anforderung

Kurz beschreiben, welcher konkrete beobachtbare Zustand falsch ist oder welches Verhalten ergänzt werden soll.

## Abnahmekriterien

- [ ] Ausgangszustand ist definiert.
- [ ] Auslösende Aktion ist definiert.
- [ ] Erwartetes Ergebnis ist beobachtbar beschrieben.
- [ ] Relevanter Negativ-/Fehlerfall ist beschrieben.
- [ ] Unveränderte fachliche Logik ist ausdrücklich genannt.
- [ ] Falls Daten betroffen: Persistenz/Reload/Sync ist beschrieben.

### Zusätzlich bei UI

- Zielgerät / Viewport:
- Referenz-Screenshot oder konkrete Layoutanforderung:
- [ ] Muss sichtbar sein:
- [ ] Darf nicht sichtbar sein:
- [ ] Darf sich nicht überlagern:
- [ ] Rückweg / nächste Aktion:
- [ ] Browser-Render im Zielviewport geprüft.
- [ ] Referenz-/Geometrievergleich bestanden.

## Verifikation

### Automatisiert

- [ ] passender Fach-/Unit-Smoke
- [ ] relevanter Browser-Smoke
- [ ] Project-Control-Smoke
- [ ] vollständige erforderliche CI

### Praktisch

- [ ] Zielgerät/-browser geprüft, falls erforderlich.
- [ ] Keine Regression im unmittelbar benachbarten Kernpfad.

## Produktion

- [ ] auf `main` gemergt
- [ ] Main-CI grün
- [ ] Pages-Deploy grün
- [ ] produktive Anwendung geprüft, falls sichtbar/ablaufrelevant
- [ ] `CURRENT_STATE.md` aktualisiert, falls produktrelevant
- [ ] `V1_ACCEPTANCE_TEST.md` / `TEST_MATRIX.md` aktualisiert, falls Testanforderung betroffen

Erst wenn die zutreffenden Produktionspunkte erfüllt sind, darf der Status entsprechend als `PRODUCTION` bzw. `LIVE VERIFIED` bezeichnet werden.
