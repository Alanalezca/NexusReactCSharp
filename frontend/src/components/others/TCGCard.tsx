import { useEffect, useState } from 'react';
import styles from './TCGCard.module.css';

const TCGCard = ({
    nomCarte,
    imageCarte,
    rareteCarte,
    handleClicValiderCarte,
    isLoading
}) => {

    const placeholder = "/images/keyforge/KeyforgeNC.png";

    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        setImageLoaded(false);
    }, [imageCarte]);

    return (
        <div
            className={`
                ${styles.cardWrapper}
                ${isLoading ? styles.cardWrapperIsLoading : ''}
                ${styles[rareteCarte]}
            `}
        >
            {/* Image temporaire */}
            <img
                src={placeholder}
                alt="Chargement"
                className={styles.cardPlaceholder}
            />

            {/* Véritable carte */}
            {imageCarte && (
                <img
                    key={imageCarte}
                    src={imageCarte}
                    alt={nomCarte}
                    className={`
                        ${styles.cardImage}
                        ${imageLoaded ? styles.cardImageLoaded : ''}
                    `}
                    onLoad={() => setImageLoaded(true)}
                    onClick={handleClicValiderCarte}
                />
            )}
        </div>
    );
};

export default TCGCard;