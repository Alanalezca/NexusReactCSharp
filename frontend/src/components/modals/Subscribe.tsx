import { useState, useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import FloatingLabel from '../inputs/FloatingInput';
import { useOngletAlerteContext } from '../contexts/ToastContext';
import styles from './Subscribe.module.css';
import { apiFetch } from "../../api/client";

const SubscribeFormV2 = ({handleClose, show, handleShowLogin, handleShowReinitPassword}) => {
  const { showOngletAlerte } = useOngletAlerteContext();
  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

const saisieOK =
  pseudo.trim() !== '' &&
  email.includes("@") &&
  email.includes(".") &&
  password.length >= 8;

  //const { showToast } = useToastContext();


  const soumissionFormCreationCompte = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!saisieOK) return;

    setError('');

    try {
      const data = await apiFetch('/api/Auth/register', {
        method: 'POST',
        body: JSON.stringify({
          pseudo,
          email,
          password
        }),
      });

      console.log('Utilisateur créé :', data);

      showOngletAlerte(
        'success',
        '(Enregistrement)',
        '',
        'Votre compte a bien été créé. Vous pouvez à présent vous connecter.'
      );

    } catch (err) {
      console.error('Erreur création compte :', err);

      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Une erreur s'est produite.");
      }
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      keyboard={false}
    >
      <form onSubmit={soumissionFormCreationCompte}>
      <Modal.Header closeButton className={`${styles.borderTop} bgcolorC modalTopBordBotTransparent`}>
        <Modal.Title className="txtColorWhite">S'enregistrer</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className={`bgcolorC ${styles.borderMid}`}>
          <FloatingLabel
            strLibelleLabel="Identifiant"
            strTypeInput="text"
            value={pseudo}
            cbOnChange={(e) => setPseudo(e.target.value)}
          />
          <FloatingLabel
            strLibelleLabel="Email"
            strTypeInput="email"
            value={email}
            cbOnChange={(e) => setEmail(e.target.value)}
          />
          <FloatingLabel
            strLibelleLabel="Mot de passe"
            strTypeInput="password"
            value={password}
            cbOnChange={(e) => setPassword(e.target.value)}
          />
      </Modal.Body>

      <Modal.Footer className={`${styles.LoginModalBot} ${styles.borderBottom}`}>
        <label className={styles.login} onClick={() => {handleShowLogin(true); handleClose(false);}} >Se connecter</label>
        <label> / </label>
        <label className={styles.login} onClick={() => {handleShowReinitPassword(true); handleClose(false);}}>Mot de passe oublié</label>
        <Button
          id="btnValiderCreationCompte"
          type="submit"
          variant="primary"
          className={saisieOK ? 'btn-ColorA' : 'btn-ColorInactif'}
          disabled={!saisieOK}
        >
          Valider l'enregistrement
        </Button>
      </Modal.Footer>
      </form>
    </Modal>
  );
};

export default SubscribeFormV2;
