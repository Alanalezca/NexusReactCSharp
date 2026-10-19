import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { apiFetch, ApiError } from '../../api/client';
import styles from './resetPassword.module.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  // Réinitialiser l’état si l’utilisateur ouvre un autre lien dans le même onglet.
  return <ResetPasswordForm key={token} token={token} finish={() => navigate('/', { replace: true })} />;
}

function ResetPasswordForm({ token, finish }: { token: string; finish: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);
  const validLink = /^[0-9a-fA-F]{64}$/.test(token);
  const validPassword = password.trim().length > 0 && password.length >= 8 &&
    new TextEncoder().encode(password).length <= 72;
  const passwordsMatch = password === confirmation;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validLink || !validPassword || !passwordsMatch || submitting.current) return;

    submitting.current = true;
    setLoading(true);
    setError('');
    try {
      await apiFetch('/api/Auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password, passwordConfirmation: confirmation }),
      });
      setPassword('');
      setConfirmation('');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError
        ? err.message
        : 'Impossible de joindre le serveur. Veuillez réessayer.');
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="container-xl mt-5 mb-5">
      <section className={`${styles.panel} bgcolorC txtColorWhite`} aria-labelledby="reset-password-title">
        <h2 id="reset-password-title" className="text-center mb-4">Réinitialisation du mot de passe</h2>
        {success ? (
          <div role="status">
            <p>Votre mot de passe a été modifié. Vous pouvez à présent vous connecter via le bouton de connexion en haut de la page.</p>
            <Button className="btn-ColorA" onClick={finish}>Retour à l’accueil</Button>
          </div>
        ) : !validLink ? (
          <div role="alert">
            <p>Ce lien est absent ou invalide. Demandez un nouveau lien via « Mot de passe oublié » dans la fenêtre de connexion.</p>
            <Link to="/" className={styles.link}>Retour à l’accueil</Link>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p>Choisissez votre nouveau mot de passe (au moins 8 caractères).</p>
            <div className="mb-3">
              <label htmlFor="new-password" className="form-label">Nouveau mot de passe</label>
              <input id="new-password" className="form-control" type="password" autoComplete="new-password"
                required minLength={8} value={password} disabled={loading}
                onChange={(event) => { setPassword(event.target.value); setError(''); }} />
            </div>
            <div className="mb-3">
              <label htmlFor="confirm-password" className="form-label">Confirmer le nouveau mot de passe</label>
              <input id="confirm-password" className="form-control" type="password" autoComplete="new-password"
                required minLength={8} value={confirmation} disabled={loading}
                aria-describedby="password-feedback"
                onChange={(event) => { setConfirmation(event.target.value); setError(''); }} />
            </div>
            <div id="password-feedback" aria-live="polite">
              {password && password.length < 8 && <p className="text-danger">Utilisez au moins 8 caractères.</p>}
              {new TextEncoder().encode(password).length > 72 && <p className="text-danger">Ce mot de passe est trop long. Veuillez le raccourcir.</p>}
              {confirmation && !passwordsMatch && <p className="text-danger">Les deux mots de passe doivent être identiques.</p>}
            </div>
            {error && <div className="text-danger mb-3" role="alert">{error}</div>}
            {error && <p>Si le lien a expiré ou a déjà été utilisé, demandez-en un nouveau via « Mot de passe oublié » dans la fenêtre de connexion.</p>}
            <Button type="submit" className={validPassword && passwordsMatch && !loading ? 'btn-ColorA' : 'btn-ColorInactif'}
              disabled={!validPassword || !passwordsMatch || loading}>
              {loading ? 'Enregistrement en cours…' : 'Enregistrer le nouveau mot de passe'}
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
