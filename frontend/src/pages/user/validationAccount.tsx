import {useState, useEffect} from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch, ApiError } from "../../api/client";
import Loader from '../../components/others/Loader';
import { useOngletAlerteContext } from '../../components/contexts/ToastContext';

const ValidationAccount = () => { 
  const [loadingVerifAccount, setLoadingVerifAccount] = useState(false);
  const [searchParams] = useSearchParams();
  const token: string | null = searchParams.get('token');
  const [verifOK, setVerifOK] = useState<boolean | null>(null);
  const { showOngletAlerte } = useOngletAlerteContext();
  const messageResultatVerif = {
    messVerifOK: `L'adresse email de votre compte a été vérifiée. Vous pouvez à présent vous connecter.`, 
    messVerifError: `Votre adresse email n'a pas pu être vérifiée.`
  };


  const submitTokenValidAccountUser = async (token: string) => {
    setLoadingVerifAccount(true);

    try {
      await apiFetch('/api/Auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          token
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
      setVerifOK(false);

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

  useEffect(() => {
    if (!token) {
      setVerifOK(false);
      return;
    }

    submitTokenValidAccountUser(token);
  }, [token]);

  return (
        <div className="container-xl mt-3">
                <div className="row">
                    <div className="col-12">
                        <h2 className="mt-5 text-center txtColorWhite">Vérification de l'adresse email</h2>
                    </div>
                </div>
                <div className="col-12 mt-4">
                  {loadingVerifAccount ? (
                    <Loader />
                  ) : verifOK === true ? (
                    <p className="text-center">
                      {messageResultatVerif.messVerifOK}
                    </p>
                  ) : verifOK === false ? (
                    <p className="text-center">
                      {messageResultatVerif.messVerifError}
                    </p>
                  ) : null}
                </div>
        </div>
  )
};

export default ValidationAccount;