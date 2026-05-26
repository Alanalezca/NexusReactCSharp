import styles from './CardLargeLoading.module.css';

type CardLargeLoadingProps = {
    classCSSColorBackground: string;
};

const CardLargeLoading = ({
    classCSSColorBackground
}: CardLargeLoadingProps) => {
    return (
        <div className="col-12">
            <div className={`card h-100 d-flex flex-row ${classCSSColorBackground} ${styles.shadow}`}>
                <img
                    src="/images/fontLoad.png"
                    alt=""
                    className={`${styles.cardImg} h-100`}
                />

                <div className="d-flex flex-column justify-content-between flex-grow-1">
                    <div className="card-body">
                        <h5 className="card-title">
                            <span className="placeholder col-7" />
                        </h5>

                        <p className="card-text">
                            <span className="placeholder col-10" />
                        </p>

                        <p className="card-text">
                            <span className="placeholder col-8" />
                        </p>
                    </div>

                    <div className="card-footer">
                        <small className="text-body-secondary">
                            <span className="placeholder col-3" />
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardLargeLoading;
