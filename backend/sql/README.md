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

## Changement du mot de passe

La page `/reinitialisation-mot-de-passe?token=…` soumet le jeton, le mot de passe
et sa confirmation à `POST /api/Auth/reset-password`. Le minimum est de huit
caractères et le maximum de 72 octets UTF-8 (limite BCrypt).

L’API contrôle le hash et l’expiration UTC, puis change le mot de passe et efface
le jeton dans une seule mise à jour conditionnelle. Une seconde soumission,
y compris simultanée, est refusée. Aucun changement SQL supplémentaire n’est nécessaire.

Sur un compte de test, vérifier :

- Lien absent ou mal formé : message explicite, aucun changement.
- Confirmation différente ou mot de passe trop court : formulaire bloqué et API en 400.
- Jeton inconnu, expiré ou déjà utilisé : API en 400, mot de passe inchangé.
- Jeton valide : API en 200, jeton effacé, nouveau mot de passe haché avec BCrypt.
- Après succès : connexion possible avec le nouveau mot de passe et refus de l’ancien.
- Deux soumissions simultanées du même jeton : une seule réussit.
- L’ouverture du lien seule ne consomme pas le jeton.

La réinitialisation ne valide pas l’adresse email, ne débloque pas un compte et
ne connecte pas automatiquement l’utilisateur. Les sessions JWT déjà émises
conservent leur durée de validité actuelle.
