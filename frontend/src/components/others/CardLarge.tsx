import styles from './CardLarge.module.css';
import { Link } from 'react-router-dom';

type CardLargeProps = {
    classCSSColorBackground: string;
    cheminImg: string;
    classCSSColorTxtTitre: string;
    titre: string;
    classCSSColorTxtContenu: string;
    texteContenu: string;
    classCSSColorTxtBottom: string;
    texteBottom: string;
    tags?: string;
    slugArticle: string;
};

const CardLarge = ({
    classCSSColorBackground,
    cheminImg,
    classCSSColorTxtTitre,
    titre,
    classCSSColorTxtContenu,
    texteContenu,
    classCSSColorTxtBottom,
    texteBottom,
    tags,
    slugArticle
}: CardLargeProps) => {
    const tagsArray = tags
        ? tags.split(",").map(tag => tag.trim()).filter(Boolean)
        : [];

    return (
        <div className="col-12">
            <Link to={`/article/view/${slugArticle}`}>
                <div className={`card d-flex flex-row ${classCSSColorBackground} ${styles.shadow} ${styles.cadreEnglobant} ${styles.card}`}>
                    <img
                        src={cheminImg}
                        alt={titre}
                        className={styles.cardImg}
                    />

                    <div className={`d-flex flex-column justify-content-between flex-grow-1 ${styles.cadreEnglobant}`}>
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
                </div>
            </Link>
        </div>
    );
};

export default CardLarge;