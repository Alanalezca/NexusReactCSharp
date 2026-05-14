import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionUserContextProvider } from "./components/contexts/sessionUserContext";
import { OngletAlerteProvider } from "./components/contexts/ToastContext";
import PrivateRoute from "./components/PrivateRoute";

import MenuHeader from "./layouts/MenuHeader";
import Dashboard from "./pages/Dashboard";
import Articles from "./pages/articles/articles"

function App() {
  return (
    <SessionUserContextProvider>
      <BrowserRouter>
        <OngletAlerteProvider>
          <MenuHeader />
        </OngletAlerteProvider>

        <Routes>

          <Route path="/" element={<Articles />} />
          <Route path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </SessionUserContextProvider>
  );
}

export default App;