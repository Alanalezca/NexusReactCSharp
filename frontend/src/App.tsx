import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionUserContextProvider } from "./components/contexts/sessionUserContext";
import { OngletAlerteProvider } from "./components/contexts/ToastContext";
import PrivateRoute from "./components/PrivateRoute";

import MenuHeader from "./layouts/MenuHeader";
import Footer from './layouts/Footer';
import Dashboard from "./pages/Dashboard";
import Articles from "./pages/articles/articles"
import ArticleAdminPage from "./pages/articles/adminArticles"
import ArticlePage from "./pages/articles/articlePage";
import CreateArticle from "./pages/articles/createArticle";
import Smashup from "./pages/smashup/smashup";
import DiceThrone from '../src/pages/dicethrone/dicethrone';
import Keyforge from "./pages/keyforge/keyforge";
import Patchnotes from '../src/pages/others/patchnotes';
import ValidationAccount from '../src/pages/users/validationAccount'; 

function App() {
  return (
    <BrowserRouter>
      <OngletAlerteProvider>
        <SessionUserContextProvider>
          <div className="appLayout">
            <MenuHeader />
            <main className="appContent">
              <Routes>

                <Route path="/" element={<Articles />} />
                <Route path="/article/admin" element={<ArticleAdminPage/>} />
                <Route path="/article/view/:slug" element={<ArticlePage />} />
                <Route path="/article/create" element={<CreateArticle />} />
                <Route path="/article/create/:slug" element={<CreateArticle />} />
                <Route path="/smashup" element={<Smashup />} />
                <Route path="/dicethrone" element={<DiceThrone />} />
                <Route path="/keyforge" element={<Keyforge />} />
                <Route path="/release/patchnotes" element={<Patchnotes />} />
                <Route path="/validation-email" element={<ValidationAccount />} />
                <Route path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />

              </Routes>
            </main>
            <Footer />
          </div>
        </SessionUserContextProvider>
      </OngletAlerteProvider>
    </BrowserRouter>
  );
}

export default App;
