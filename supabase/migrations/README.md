# Supabase-Migrationen

Die Family-Sync-Datenbank des Vokabeltrainers wird in demselben Supabase-Projekt wie Johanna’s Gartenwelt betrieben.

Die Dateien in diesem Ordner verwenden die tatsächlichen Supabase-Migrationsversionen. Die globale Pre-Request-/Rate-Limit-Infrastruktur liegt derzeit im Repository `JohannasGartenwelt`, weil sie dort ursprünglich eingerichtet wurde und beide Apps schützt.

Für einen vollständigen Neuaufbau:
1. gemeinsame Garten-/API-Basis aus `JohannasGartenwelt` bereitstellen,
2. anschließend die Vokabeltrainer-Migrationen hier anwenden,
3. danach Security-/Performance-Advisors prüfen.

Neue Vokabeltrainer-DDL-Änderungen sollen ab jetzt mit ihrer echten Supabase-Migrationsversion hier versioniert werden.
