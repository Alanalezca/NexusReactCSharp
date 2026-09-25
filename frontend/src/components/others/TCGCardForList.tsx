import { useState } from 'react';
import styles from './TCGCardForList.module.css';

const TCGCardForList = ({
    numeroCarte,
    nomCarte,
    imageCarte,
    rareteCarte,
    lienImgFaction,
    couleurFactionCarte,
    libelleType,
    quantite
}) => {

    const [mousePosition, setMousePosition] = useState({
        x: 0,
        y: 0
    });

    const getIconRarete = () => {
        switch (rareteCarte) {
            case "Commune":
                return <i className="bx bxs-circle colorRareteCommune"></i>;

            case "Rare":
                return <i className="bx bxs-up-arrow colorRareteRare"></i>;

            case "Légendaire":
                return <i className="bx bxs-star colorRareteLegendaire"></i>;

            default:
                return null;
        }
    };

    return (
        <div className="col-12 mb-1 d-flex justify-content-center">

            <div
                className={styles.capsuleResumeCard}
                onMouseMove={(e) => {
                    setMousePosition({
                        x: e.clientX,
                        y: e.clientY
                    });
                }}
                style={{
                    background: `linear-gradient(
                        90deg,
                        rgba(${couleurFactionCarte}, 0.20),
                        rgba(${couleurFactionCarte}, 0.65)
                    )`
                }}
            >

                <img
                    src={lienImgFaction}
                    alt=""
                    className={styles.logoFaction}
                />

                <span
                    className={`
                        ${styles.quantite}
                        ${quantite > 1 ? styles.quantiteMultiple : ''}
                    `}
                >
                    x{quantite}
                </span>

                <span className={styles.numeroCarte}>
                    #{numeroCarte}
                </span>

                <span className={styles.nomCarte}>
                    {nomCarte}
                </span>

                <div className={styles.cardInfos}>

                    <span className={styles.typeCarte}>
                        {libelleType}
                    </span>

                    <span
                        className={styles.rareteIcon}
                        title={rareteCarte}
                    >
                        {getIconRarete()}
                    </span>

                </div>

                {imageCarte && (
                    <div
                        className={styles.cardPreview}
                        style={{
                            left: mousePosition.x + 20,
                            top: mousePosition.y
                        }}
                    >
                        <img
                            src={imageCarte}
                            alt={nomCarte}
                        />
                    </div>
                )}

            </div>

        </div>
    );
};

export default TCGCardForList;