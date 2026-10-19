import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal, Button } from 'react-bootstrap';
import FloatingLabel from '../inputs/FloatingInput';
import { useOngletAlerteContext } from '../contexts/ToastContext';
import { apiFetch, ApiError } from '../../api/client';
import styles from './PasswordReinit.module.css';

type ReinitPasswordFormProps = {
  handleClose: (show: boolean) => void;
  show: boolean;
  handleShowLogin: (show: boolean) => void;
};

const ReinitPasswordForm = ({ handleClose, show, handleShowLogin }: ReinitPasswordFormProps) => {
  const { showOngletAlerte } = useOngletAlerteContext();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);
  const saisieOK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const close = () => {
    if (submitting.current) return;
    setEmail('');
    setError('');
    handleClose(false);
  };

  const soumissionFormReinitPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!saisieOK || submitting.current) return;

    submitting.current = true;
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch<{ message: string }>('/api/Auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });

      showOngletAlerte('success', '(Mot de passe oublié)', '', data.message);
      setEmail('');
      handleClose(false);
    } catch (err) {
      setError(err instanceof ApiError
        ? err.message
        : 'Impossible d’envoyer la demande. Veuillez réessayer.');
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={close} centered backdrop="static" keyboard={false}>
      <form onSubmit={soumissionFormReinitPassword}>
        <Modal.Header closeButton={!loading} className={`${styles.borderTop} bgcolorC modalTopBordBotTransparent`}>
          <Modal.Title className="txtColorWhite">Mot de passe oublié</Modal.Title>
        </Modal.Header>

        <Modal.Body className={`bgcolorC ${styles.borderMid}`}>
          <p className="txtColorWhite">Indiquez votre adresse email pour recevoir un lien de réinitialisation.</p>
          <FloatingLabel
            strID="password-reinit-email"
            strLibelleLabel="Email"
            strTypeInput="email"
            value={email}
            cbOnChange={(e) => setEmail(e.target.value)}
          />
          {error && <div className="text-danger txt-xs" role="alert">{error}</div>}
        </Modal.Body>

        <Modal.Footer className={`${styles.ReinitPasswordModalBot} ${styles.borderBottom}`}>
          <Button variant="link" className={styles.login} disabled={loading} onClick={() => {
            close();
            handleShowLogin(true);
          }}>Se connecter</Button>
          <Button
            type="submit"
            variant="primary"
            className={saisieOK && !loading ? 'btn-ColorA' : 'btn-ColorInactif'}
            disabled={!saisieOK || loading}
          >
            {loading ? 'Envoi en cours…' : 'Envoyer le lien'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default ReinitPasswordForm;
