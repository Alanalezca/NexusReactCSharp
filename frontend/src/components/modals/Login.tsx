import { Modal, Button } from 'react-bootstrap';
import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useSessionUserContext } from '../contexts/sessionUserContext';
import { useOngletAlerteContext } from '../contexts/ToastContext';
import styles from './Login.module.css';
import FloatingInput from '../inputs/FloatingInput';
import { useNavigate } from "react-router-dom";

type LoginFormProps = {
  handleClose: (show: boolean) => void;
  show: boolean;
  handleShowSubscribe: (show: boolean) => void;
};

const LoginModal = ({ handleClose, show, handleShowSubscribe}: LoginFormProps) => {
  const { showOngletAlerte } = useOngletAlerteContext();
  const [logOrEmail, setLogOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useSessionUserContext();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const saisieOK = logOrEmail.trim() !== '' && password !== '';


  const handleLogin = async (loginOrEmail: string, password: string): Promise<void> => {
    const success = await login(loginOrEmail.trim(), password);

    if (success) {
      navigate("/");
      handleClose(false);
      showOngletAlerte('success', '(Connexion)', '', 'Vous êtes à présent connecté.');
    } else {
      setError("Identifiant ou mot de passe incorrect");
    }
  };

  return (
    <Modal show={show} onHide={() => handleClose(false)} centered>
      <Modal.Header closeButton className={`${styles.borderTop} bgcolorC modalTopBordBotTransparent`}>
        <Modal.Title className="txtColorWhite">Connexion</Modal.Title>
      </Modal.Header>

      <Modal.Body className={`bgcolorC ${styles.borderMid}`}>
        <FloatingInput strLibelleLabel="Identifiant ou email" strTypeInput="text" value={logOrEmail} cbOnChange={(e: ChangeEvent<HTMLInputElement>) => setLogOrEmail(e.target.value)}/>
        <FloatingInput strLibelleLabel="Mot de passe" strTypeInput="password" value={password} cbOnChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}/>
        {error && <div className="text-danger txt-xs">{error}</div>}
      </Modal.Body>

      <Modal.Footer className={`${styles.LoginModalBot} ${styles.borderBottom}`}>
        <a className={styles.subscribe}>Mot de passe oublié</a>
        <label> / </label>
        <a className={styles.subscribe} onClick={() => {handleShowSubscribe(true); handleClose(false);}}>S'enregistrer</a>
        <Button variant="primary" className={saisieOK ? 'btn-ColorA' : 'btn-ColorInactif'} onClick={() => handleLogin(logOrEmail, password)} disabled={!saisieOK}>
          Connexion
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LoginModal;
