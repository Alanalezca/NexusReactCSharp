import { useRef, useState } from 'react';
import styles from './TrinomeMobile.module.css';

const TrinomeMobile = ({ cards, isLoading, onValidate }) => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
    const activeCard = cards[activeIndex];

    const showCard = (index: number) => {
        const carousel = carouselRef.current;
        if (!carousel || isLoading) return;
        const first = carousel.children[0] as HTMLElement;
        const target = carousel.children[index] as HTMLElement;
        if (!first || !target) return;
        carousel.scrollTo({
            left: target.offsetLeft - first.offsetLeft,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
        });
    };

    if (!activeCard) return null;

    return (
        <div className={`d-md-none ${styles.mobileChoices}`} aria-label="Choix parmi les trois cartes" aria-busy={isLoading}>
            <div
                ref={carouselRef}
                className={styles.carousel}
                role="region"
                aria-label="Cartes proposées, balayez pour les parcourir"
                tabIndex={0}
                onKeyDown={event => {
                    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                        event.preventDefault();
                        showCard(Math.max(0, Math.min(cards.length - 1, activeIndex + (event.key === 'ArrowRight' ? 1 : -1))));
                    }
                }}
                onScroll={() => {
                    const carousel = carouselRef.current;
                    if (!carousel) return;
                    const first = carousel.children[0] as HTMLElement;
                    let nearest = 0;
                    let distance = Infinity;
                    Array.from(carousel.children).forEach((child, index) => {
                        const delta = Math.abs((child as HTMLElement).offsetLeft - first.offsetLeft - carousel.scrollLeft);
                        if (delta < distance) {
                            distance = delta;
                            nearest = index;
                        }
                    });
                    setActiveIndex(nearest);
                }}
            >
                {cards.map((card, index) => (
                    <div className={styles.slide} key={`${card.idCarte}-${card.classement}`} role="group" aria-label={`Carte ${String.fromCharCode(65 + index)} sur ${cards.length}`}>
                        <img
                            className={styles.cardImage}
                            src={card.cheminImgCarte || '/images/keyforge/KeyforgeNC.png'}
                            alt={`Carte ${String.fromCharCode(65 + index)}`}
                            draggable={false}
                            onLoad={() => setLoadedImages(previous => ({ ...previous, [card.cheminImgCarte]: true }))}
                            onError={() => setLoadedImages(previous => ({ ...previous, [card.cheminImgCarte]: false }))}
                        />
                    </div>
                ))}
            </div>
            <p className={styles.position} aria-live="polite">Carte {String.fromCharCode(65 + activeIndex)} · {activeIndex + 1} / {cards.length}</p>
            <div className={styles.thumbnails} aria-label="Afficher une carte">
                {cards.map((card, index) => (
                    <button
                        key={`${card.idCarte}-${card.classement}`}
                        type="button"
                        className={`${styles.thumbnail} ${index === activeIndex ? styles.active : ''}`}
                        aria-label={`Afficher la carte ${String.fromCharCode(65 + index)}`}
                        aria-pressed={index === activeIndex}
                        disabled={isLoading}
                        onClick={() => showCard(index)}
                    >
                        <img src={card.cheminImgCarte || '/images/keyforge/KeyforgeNC.png'} alt="" draggable={false} />
                        <span>{String.fromCharCode(65 + index)}</span>
                    </button>
                ))}
            </div>
            <button
                type="button"
                className={`btn btn-primary btn-ColorA ${styles.validate}`}
                disabled={isLoading || !activeCard.cheminImgCarte || !loadedImages[activeCard.cheminImgCarte]}
                onClick={() => { if (!isLoading) onValidate(activeCard); }}
            >
                {isLoading ? 'Validation en cours…' : `Valider carte ${String.fromCharCode(65 + activeIndex)}`}
            </button>
        </div>
    );
};

export default TrinomeMobile;
