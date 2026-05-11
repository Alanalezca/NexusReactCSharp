import { Navigate } from "react-router-dom";
import { useSessionUserContext } from "../components/contexts/sessionUserContext";

// Se base sur le contexte d'authentification pour autoriser ou non
// la navigation vers le children

type Props = {
  children: React.ReactNode;
};

export default function PrivateRoute({ children }: Props) {
  const { sessionUser, loading } = useSessionUserContext();

  if (loading) {
    return <p>Chargement...</p>;
  }

  // Si pas connecté -> login
  if (!sessionUser) {
    return <Navigate to="/login" replace />;
  }

  // Sinon accès autorisé
  return <>{children}</>;
}