import { useSessionUserContext } from "../components/contexts/sessionUserContext";

export default function Dashboard() {
  const { sessionUser } = useSessionUserContext();

  return (
    <div>
      <h2>Dashboard</h2>

      {sessionUser ? (
        <pre>{JSON.stringify(sessionUser, null, 2)}</pre>
      ) : (
        <p>Aucun utilisateur chargé</p>
      )}
    </div>
  );
}