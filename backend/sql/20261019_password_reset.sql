-- À exécuter sur PostgreSQL avant de déployer l’API.
BEGIN;

ALTER TABLE tab_users
    ADD COLUMN IF NOT EXISTS hashtokenreinitialisationpassword text,
    ADD COLUMN IF NOT EXISTS expirationtokenreinitialisationpassword timestamp with time zone;

COMMIT;
