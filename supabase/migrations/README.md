# Supabase-Migrationen

Die Family-Sync-Datenbank des Vokabeltrainers wird in demselben Supabase-Projekt wie Johanna’s Gartenwelt betrieben.

Die Dateien in diesem Ordner verwenden die tatsächlichen Supabase-Migrationsversionen. Die globale Pre-Request-/Rate-Limit-Infrastruktur liegt derzeit im Repository `JohannasGartenwelt`, weil sie dort ursprünglich eingerichtet wurde und beide Apps schützt.

Für einen vollständigen Neuaufbau:
1. gemeinsame Garten-/API-Basis aus `JohannasGartenwelt` bereitstellen,
2. anschließend die Vokabeltrainer-Migrationen hier anwenden,
3. danach Security-/Performance-Advisors prüfen.

Neue Vokabeltrainer-DDL-Änderungen sollen ab jetzt mit ihrer echten Supabase-Migrationsversion hier versioniert werden. Neue Data-API-Objekte erhalten ihre minimal nötigen `GRANT`s explizit in derselben Migration; auf automatische Default-Grants wird nicht mehr vertraut.


## Produktiv geprüfter gemeinsamer Sicherheitsstand

Zuletzt gegen das produktive Supabase-Projekt geprüft: **24.09.2026**.

Die folgenden gemeinsamen Migrationen liegen absichtlich im Repository `JohannasGartenwelt`
und werden hier nicht dupliziert:

- `20260921100151_harden_vt_rate_limits`
- `20260921134427_global_rate_limit_cleanup`
- `20260924070028_harden_data_api_default_privileges`

Der PostgREST-`authenticator` ist produktiv mit
`pgrst.db_pre_request=private.jgw_pre_request` konfiguriert. Diese Pre-Request-Funktion
schützt unter anderem die Vokabeltrainer-RPCs mit IP-basierten Limits:

- Familie anlegen: 10 Anfragen / Stunde
- Eltern-Gerät beitreten: 12 Anfragen / 15 Minuten
- Kinder-Einladung einlösen: 30 Anfragen / 15 Minuten
- Geräteverwaltung: 60 Anfragen / 5 Minuten
- Pull/Push/Status-Sync: 180 Anfragen / 5 Minuten

Die `private.vt_*`-Tabellen sind für `anon` nicht direkt lesbar. Der Browser verwendet
ausschließlich den Supabase-Publishable-Key und die vorgesehenen öffentlichen RPC-Wrapper.
Die privaten Implementierungen prüfen zusätzlich Familien-/Gerätekennung und Gerätegeheimnis.

**Recovery-Regel:** Ein Neuaufbau ist erst vollständig, wenn sowohl die gemeinsame
Pre-Request-/Rate-Limit-Basis als auch die Vokabeltrainer-Migrationen vorhanden sind.
Nach Änderungen an einem der beiden Repositories müssen die produktiven Migrationen,
PostgREST-Konfiguration sowie Supabase Security-/Performance-Advisors erneut geprüft werden.
