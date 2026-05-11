// src/pages/Admin.jsx
import { useAuth } from "../auth/AuthContext";

export default function Admin() {
    const { user } = useAuth();

    if (!user || Number(user.role) < 10) {
        return <p>Access denied</p>;
    }

    return <h2>Admin panel</h2>;
}