# Demande de réinitialisation du mot de passe

Avant de déployer cette version de l’API, exécuter `20261019_password_reset.sql`
sur la base PostgreSQL cible. Le script ajoute deux colonnes nullables à
`tab_users` et peut être relancé. Aucun script n’est appliqué automatiquement.

Le service réutilise les paramètres SMTP de l’inscription. Pour un environnement
local, définir `Frontend__BaseUrl=http://localhost:5173` dans l’environnement de
l’API. Sans cette option, les liens pointent vers `https://alanalezca.fr`.

## Vérification manuelle

- Envoyer `POST /api/Auth/forgot-password` avec `{"email":"adresse-du-compte"}` :
  réponse 200 avec une confirmation générique et réception d’un email.
- Vérifier que seul le SHA-256 du jeton est enregistré, avec une expiration UTC
  à une heure. Le mot de passe et les jetons de validation d’email restent inchangés.
- Répéter dans les cinq minutes : même réponse, sans nouvel email ni nouveau jeton.
- Utiliser une adresse inconnue : même réponse, aucune modification en base.
- Une adresse invalide renvoie 400. Dans le formulaire, un échec réseau conserve
  la fenêtre et affiche une erreur ; Entrée et le bouton soumettent le même formulaire.
- Si le SMTP échoue, l’API journalise le type d’erreur et annule le jeton pour
  permettre une nouvelle tentative. La réponse reste générique pour ne pas révéler
  l’existence d’un compte.

## Étape suivante

La page `/reinitialisation-mot-de-passe` et l’API de changement de mot de passe
ne sont pas encore implémentées. Le lien envoyé ne permet donc pas encore de
modifier le mot de passe. L’étape suivante devra vérifier le hash et l’expiration,
enregistrer le nouveau mot de passe haché et consommer le jeton de façon atomique
pour garantir son usage unique.
