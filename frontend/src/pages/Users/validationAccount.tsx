import {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch, ApiError } from "../../api/client";
import Loader from '../../components/others/Loader';
import { useOngletAlerteContext } from '../../components/contexts/ToastContext';

const ValidationAccount = () => { 
  const [messageToShow, setMessageToShow] = useState("");
  const [loadingVerifAccount, setLoadingVerifAccount] = useState(false);
  const slug = useParams<{ token: string }>();
  const [verifOK, setVerifOK] = useState(false);
const { showOngletAlerte } = useOngletAlerteContext();
  
  const submitTokenValidAccountUser = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setLoadingVerifAccount(true);

    try {
      const data = await apiFetch('/api/Auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          slug
        }),
      });

      showOngletAlerte(
        'success',
        '(Vérification)',
        '',
        'Votre adresse email a bien été vérifiée. Vous pouvez à présent vous connecter.'
      );

      setVerifOK(true);

    } catch (err) {
      console.error('Erreur vérification email :', err);

      if (err instanceof ApiError) {
        console.log(err.message);
      } else {
        showOngletAlerte(
          'error',
          '(Vérification)',
          '',
          `Une erreur est survenue lors de la vérification de votre adresse email.`
        );
      }
    } finally {
      setLoadingVerifAccount(false);
    }

  };

  return (
        <div className="container-xl mt-3">
                <div className="row">
                    <div className="col-12">
                        <h2 className="mt-5 text-center txtColorWhite">Vérification de l'adresse email</h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 mt-4">
                        {!verifOK ? <Loader/>
                        : <p className="text-center">L'adresse email de votre compte a été vérifiée.<br/>Vous pouvez à présent vous connecter.</p>
                        }
                    </div>
                </div>
        </div>
  )
};

export default ValidationAccount;