import { useEffect, useState } from 'react';
import styles from './TCGCardVisuForList.module.css';

interface TCGCardMiniProps {
    nomCarte: string | null;
    imageCarte: string | null;
}

const TCGCardMini = ({
    nomCarte,
    imageCarte
}: TCGCardMiniProps) => {

    const placeholder = "/images/keyforge/KeyforgeNC.png";

    const [imageLoaded, setImageLoaded] = useState(false);

    // Si l'image change, on repasse temporairement
    // sur le placeholder pendant son chargement.
    useEffect(() => {
        setImageLoaded(false);
    }, [imageCarte]);

    return (
        <div className={styles.cardWrapper}>

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
                    alt={nomCarte ?? ""}
                    className={`
                        ${styles.cardImage}
                        ${imageLoaded ? styles.cardImageLoaded : ''}
                    `}
                    onLoad={() => setImageLoaded(true)}
                />
            )}

        </div>
    );
};

export default TCGCardMini;