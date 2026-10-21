import { Modal, Button } from 'react-bootstrap';
import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useSessionUserContext } from '../contexts/sessionUserContext';
import { useOngletAlerteContext } from '../contexts/ToastContext';
import styles from './Login.module.css';
import FloatingInput from '../inputs/FloatingInput';
import { useNavigate } from "react-router-dom";

type LoginFormProps = {
  handleClose: (show: boolean) => void;
  show: boolean;
  handleShowSubscribe: (show: boolean) => void;
  handleShowReinitPassword: (show: boolean) => void;
};

const LoginModal = ({ handleClose, show, handleShowSubscribe, handleShowReinitPassword}: LoginFormProps) => {
  const { showOngletAlerte } = useOngletAlerteContext();
  const [logOrEmail, setLogOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useSessionUserContext();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loadingLogin, setLoadingLogin] = useState(false);
  const submitting = useRef(false);

  const saisieOK = logOrEmail.trim() !== '' && password !== '';


  const handleLogin = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!saisieOK || submitting.current) return;

    submitting.current = true;
    setLoadingLogin(true);
    try {
      const success = await login(logOrEmail.trim(), password);

      if (success) {
        navigate("/");
        handleClose(false);
        showOngletAlerte('success', '(Connexion)', '', 'Vous êtes à présent connecté.');
      } else {
        setError("Identifiant ou mot de passe incorrect");
      }
    } finally {
      submitting.current = false;
      setLoadingLogin(false);
    }
  };

  return (
    <Modal show={show} onHide={() => handleClose(false)} centered>
      <form onSubmit={handleLogin}>
        <Modal.Header closeButton className={`${styles.borderTop} bgcolorC modalTopBordBotTransparent`}>
          <Modal.Title className="txtColorWhite">Connexion</Modal.Title>
        </Modal.Header>

        <Modal.Body className={`bgcolorC ${styles.borderMid}`}>
          <FloatingInput strLibelleLabel="Identifiant ou email" strTypeInput="text" value={logOrEmail} cbOnChange={(e: ChangeEvent<HTMLInputElement>) => setLogOrEmail(e.target.value)}/>
          <FloatingInput strLibelleLabel="Mot de passe" strTypeInput="password" value={password} cbOnChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}/>
          {error && <div className="text-danger txt-xs">{error}</div>}
        </Modal.Body>

        <Modal.Footer className={`${styles.LoginModalBot} ${styles.borderBottom}`}>
          <a className={styles.subscribe} onClick={() => {handleShowReinitPassword(true); handleClose(false);}}>Mot de passe oublié</a>
          <label> / </label>
          <a className={styles.subscribe} onClick={() => {handleShowSubscribe(true); handleClose(false);}}>S'enregistrer</a>
          <Button type="submit" variant="primary" className={saisieOK && !loadingLogin ? 'btn-ColorA' : 'btn-ColorInactif'} disabled={!saisieOK || loadingLogin}>
            Connexion
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default LoginModal;
