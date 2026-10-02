import { useEffect, useState } from 'react';
import styles from './TCGCardVisuForList.module.css';

interface TCGCardVisuForListProps {
    numeroCarte: number;
    nomCarte: string | null;
    imageCarte: string | null;
    marquageCarte: (numeroCarte: number) => void;
    flagCarteMarquee: boolean;
}

const TCGCardVisuForList = ({
    numeroCarte,
    nomCarte,
    imageCarte,
    marquageCarte,
    flagCarteMarquee
}: TCGCardVisuForListProps) => {

    const placeholder = "/images/keyforge/KeyforgeNC.png";

    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        setImageLoaded(false);
    }, [imageCarte]);

    return (
        <div
            className={`
                ${styles.cardWrapper}
                ${flagCarteMarquee ? styles.carteMarquee : ''}
            `}
            onClick={() => marquageCarte(numeroCarte)}
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
                    alt={nomCarte ?? ""}
                    className={`
                        ${styles.cardImage}
                        ${imageLoaded ? styles.cardImageLoaded : ''}
                    `}
                    onLoad={() => setImageLoaded(true)}
                />
            )}

            {/* Indicateur carte récupérée */}
            <span
                className={`
                    ${styles.carteMarqueeIcon}
                    ${flagCarteMarquee ? styles.carteMarqueeIconVisible : ''}
                `}
            >
                <i className="bx bx-check"></i>
            </span>

        </div>
    );
};

export default TCGCardVisuForList;