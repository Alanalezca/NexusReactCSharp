import { useSessionUserContext } from '../components/contexts/sessionUserContext';
import { useOngletAlerteContext } from '../components/contexts/ToastContext';
import { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import styles from './MenuHeader.module.css';
import Login from '../components/modals/Login';
import Subscribe from '../components/modals/Subscribe';
  
  const MenuHeader = () => {
    const { showOngletAlerte } = useOngletAlerteContext();
    const { logout, sessionUser } = useSessionUserContext();
    const menuRef = useRef<HTMLUListElement | null>(null);
    const burgerRef = useRef<HTMLButtonElement | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showModalLogin, setShowModalLogin] = useState(false);
    const [showModalSubscribe, setShowModalSubscribe] = useState(false);

    // Détection du clic hors menu mini pour déclencher sa close
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;

        if (
          menuOpen && 
          menuRef.current &&
          !menuRef.current.contains(target) &&
          burgerRef.current &&
          !burgerRef.current.contains(target)
        ) {
          setMenuOpen(false);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [menuOpen]);

    return (
    <><Subscribe show={showModalSubscribe} 
          handleClose={setShowModalSubscribe} 
          handleShowLogin={setShowModalLogin}
      />
      <Login show={showModalLogin} 
            handleClose={setShowModalLogin} 
            handleShowSubscribe={setShowModalSubscribe}
      />
      <nav className={`txt-base ${styles.navbar}`}>
            {/* bouton burger */}
            <button
                ref={burgerRef}
                className={styles.burger}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
            >
                ☰
            </button>


        {/* Menu Principal */}
        <ul ref={menuRef} 
            className={`${styles.MenuHeaderMini} 
            ${!menuOpen && styles.MenuHeader} 
            ${menuOpen && styles.open}`}
        >
          <li><Link to="/">Articles</Link></li>
          <li>
              <a href="#">Drafters</a>
                <ul className={menuOpen ? styles.subMenusMini : styles.subMenus}>
                  <li><Link to="/smashup">Smash Up</Link></li>
                  <li><Link to="/dicethrone">Dice Throne</Link></li>
                  <li><Link to="/keyforge">Keyforge</Link></li>
                </ul>
          </li>
        </ul>

        {/* Zone Utilisateur */}
        <div className={styles.blocLoginEnglobant}>
          <div className={styles.blocLogin}>
              {sessionUser ? (
                <div className={styles.userInfo}>
                  {sessionUser["grade"] === "Administrateur" ?
                  <>
                    <Link to={`/article/admin`}>
                      <div className={styles.btnDisconnect}>
                        <button className={`bx bx-list-ul bxNormalOrange`}></button>
                      </div>
                    </Link>
                    <Link to={`/article/create`}>
                      <div className={styles.btnDisconnect}>
                        <button className={`bx bx-list-plus bxNormalOrange`}></button>
                      </div>
                    </Link>
                    <div className={styles.btnDisconnect}>
                      <button className={`bx bxs-cog bxNormalGrey`}></button>
                    </div>
                  </>: null}
                  <span className={`txtColorA ps-1 txtBold 
                    ${styles.pseudoUser} 
                    ${styles.marginRight}`}
                  >
                    {sessionUser.pseudo}
                  </span>
                    <div className={styles.btnDisconnect}>
                      <button className={`bx bxs-exit bxNormalOrange`} 
                        aria-label="Déconnexion" 
                        onClick={async () => {await logout(); showOngletAlerte('success', '(Déconnexion)', '', 'Vous êtes à présent déconnecté.');}}>
                      </button>
                    </div>
                  </div>
              ) : (<>
                      <button type="button" 
                        className={`btn btn-primary btn-ColorA ${styles.positionBtnCnx}`} 
                        onClick={() => setShowModalLogin(true)}
                      >
                        Connexion
                      </button>
                  </>
              )}
          </div>
        </div>
      </nav>
    </>
    );
  };
  
  export default MenuHeader;
