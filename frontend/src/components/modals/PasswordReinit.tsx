import { useState, useRef, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import FloatingLabel from '../inputs/FloatingInput';
import { useOngletAlerteContext } from '../contexts/ToastContext';
import styles from './PasswordReinit.module.css';

const ReinitPasswordForm = ({handleClose, show, handleShowLogin}) => {
  const { showOngletAlerte } = useOngletAlerteContext();
  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saisieOK, setSaisieOK] = useState(false);
  const [error, setError] = useState('');

  //const { showToast } = useToastContext();

  // Utilisation de useRef pour l'icône de fermeture
  const closeModalIconRefSubscribe = useRef(null);

  const handleKeyPressEnter = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      soumissionFormReinitPassword(event); // Appel de la fonction pour valider la création de compte
    }
  };

  useEffect(() => {
    if (email.includes("@") && email.includes(".")) {
      //setSaisieOK(true); a reactiver une fois développé
    } else {
      setSaisieOK(false);
    }
  }, [email]);

  const soumissionFormReinitPassword = async (event) => {
    event.preventDefault();
    // a completer //
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton className="bgcolorC modalTopBordBotTransparent">
        <Modal.Title className="txtColorWhite">Mot de passe oublié</Modal.Title>
      </Modal.Header>

      <Modal.Body className="bgcolorC">
        <form onSubmit={soumissionFormReinitPassword} onKeyDown={handleKeyPressEnter}>
          <FloatingLabel
            strLibelleLabel="Email"
            strTypeInput="email"
            value={email}
            cbOnChange={(e) => setEmail(e.target.value)}
            cbOnKeyDown={handleKeyPressEnter}
          />
        </form>
      </Modal.Body>

      <Modal.Footer className={styles.ReinitPasswordModalBot}>
        <label className={styles.login} onClick={() => {handleShowLogin(true); handleClose(false);}} >Se connecter</label>
        <label> / </label>
        <label className={styles.login} onClick={() => {handleClose(false);}}>S'enregistrer</label>
        <Button
          id="btnValiderCreationCompte"
          variant="primary"
          className={saisieOK ? 'btn-ColorA' : 'btn-ColorInactif'}
          onClick={saisieOK ? soumissionFormReinitPassword : null}
          disabled={!saisieOK}
        >
          Réinitialisation du mot de passe
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReinitPasswordForm;
