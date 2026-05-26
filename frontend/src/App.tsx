import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionUserContextProvider } from "./components/contexts/sessionUserContext";
import { OngletAlerteProvider } from "./components/contexts/ToastContext";
import PrivateRoute from "./components/PrivateRoute";

import MenuHeader from "./layouts/MenuHeader";
import Dashboard from "./pages/Dashboard";
import Articles from "./pages/articles/articles"
import ArticleAdminPage from "./pages/articles/adminArticles"
import ArticlePage from "./pages/articles/articlePage"
import CreateArticle from "./pages/articles/createArticle"

function App() {
  return (
    <BrowserRouter>
      <OngletAlerteProvider>
        <SessionUserContextProvider>
          <MenuHeader />

          <Routes>

            <Route path="/" element={<Articles />} />
            <Route path="/article/admin" element={<ArticleAdminPage/>} />
            <Route path="/article/view/:slug" element={<ArticlePage />} />
            <Route path="/article/create" element={<CreateArticle />} />
            <Route path="/article/create/:slug" element={<CreateArticle />} />
            <Route path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

          </Routes>
        </SessionUserContextProvider>
      </OngletAlerteProvider>
    </BrowserRouter>
  );
}

export default App;
