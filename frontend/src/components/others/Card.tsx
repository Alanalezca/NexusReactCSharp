import styles from './Card.module.css';
import { Link } from 'react-router-dom';

type CardProps = {
    classCSSColorBackground: string;
    cheminImg: string;
    classCSSColorTxtTitre: string;
    titre: string;
    classCSSColorTxtContenu: string;
    texteContenu: string;
    classCSSColorTxtBottom: string;
    texteBottom: string;
    tailleCol?: number;
    slugArticle: string;
    tags?: string;
};

const Card = ({
    classCSSColorBackground,
    cheminImg,
    classCSSColorTxtTitre,
    titre,
    classCSSColorTxtContenu,
    texteContenu,
    classCSSColorTxtBottom,
    texteBottom,
    tailleCol = 12,
    slugArticle,
    tags
}: CardProps) => {
    const tagsArray = tags
        ? tags.split(",").map(tag => tag.trim()).filter(Boolean)
        : [];

    return (
        <div className={`col-${tailleCol} text-center ${styles.card}`}>
            <Link to={`/article/view/${slugArticle}`}>
                <div className={`card h-100 ${classCSSColorBackground} ${styles.shadow}`}>
                    <img
                        src={cheminImg}
                        className={`card-img-top ${styles.cardImg}`}
                        alt={titre}
                    />

                    <div className="card-body">
                        <h5 className={`card-title ${classCSSColorTxtTitre}`}>
                            {titre}
                        </h5>

                        <p className={`card-text ${classCSSColorTxtContenu}`}>
                            {texteContenu}
                        </p>
                    </div>

                    <div className="card-footer">
                        <small className="text-body-secondary">
                            <span className={classCSSColorTxtBottom}>
                                {texteBottom}
                            </span>
                        </small>

                        <div className="ps-2 d-inline-block">
                            {tagsArray.map(currentTag => (
                                <div
                                    className="d-inline-block me-1"
                                    key={currentTag}
                                >
                                    <span className="badge badge-custom">
                                        {currentTag}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default Card;