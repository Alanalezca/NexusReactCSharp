import styles from './Pagination.module.css';

type PaginationProps = {
    centrer?: boolean;
    totalNbElement: number;
    nbElementParPage: number;
    numCurrentPageActive: number;
    setterCurrentNumPageActive: React.Dispatch<React.SetStateAction<number>>;
};

const Pagination = ({
    centrer = false,
    totalNbElement,
    nbElementParPage,
    numCurrentPageActive,
    setterCurrentNumPageActive
}: PaginationProps) => {
    const nbPages = Math.ceil(totalNbElement / nbElementParPage);

    if (nbPages <= 1) {
        return null;
    }

    const goToPage = (page: number) => {
        if (page < 1 || page > nbPages) {
            return;
        }

        setterCurrentNumPageActive(page);
    };

    const goToPreviousPage = () => {
        goToPage(numCurrentPageActive - 1);
    };

    const goToNextPage = () => {
        goToPage(numCurrentPageActive + 1);
    };

    const getPagesToDisplay = () => {
        if (nbPages <= 7) {
            return Array.from({ length: nbPages }, (_, index) => index + 1);
        }

        if (numCurrentPageActive === 1 || numCurrentPageActive === nbPages) {
            return [1, '...', nbPages];
        }

        return [1, '...', numCurrentPageActive, '...', nbPages];
    };

    const pagesToDisplay = getPagesToDisplay();

    return (
        <ul className={`pagination ${centrer ? 'justify-content-center' : ''}`}>
            <li className={`page-item ${numCurrentPageActive === 1 ? 'disabled' : ''}`}>
                <button
                    type="button"
                    className={`page-link ${styles.nonActive}`}
                    aria-label="Page précédente"
                    onClick={goToPreviousPage}
                    disabled={numCurrentPageActive === 1}
                >
                    <span aria-hidden="true">&laquo;</span>
                </button>
            </li>

            {pagesToDisplay.map((page, index) => {
                if (page === '...') {
                    return (
                        <li key={`ellipsis-${index}`} className="page-item disabled">
                            <span className={`page-link ${styles.inactive}`}>
                                ...
                            </span>
                        </li>
                    );
                }

                const pageNumber = Number(page);
                const isActive = pageNumber === numCurrentPageActive;

                return (
                    <li
                        key={`page-${pageNumber}`}
                        className={`page-item ${isActive ? 'active' : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <button
                            type="button"
                            className={`page-link ${
                                isActive ? styles.active : styles.nonActive
                            }`}
                            onClick={() => goToPage(pageNumber)}
                            disabled={isActive}
                        >
                            {pageNumber}
                        </button>
                    </li>
                );
            })}

            <li className={`page-item ${numCurrentPageActive === nbPages ? 'disabled' : ''}`}>
                <button
                    type="button"
                    className={`page-link ${styles.nonActive}`}
                    aria-label="Page suivante"
                    onClick={goToNextPage}
                    disabled={numCurrentPageActive === nbPages}
                >
                    <span aria-hidden="true">&raquo;</span>
                </button>
            </li>
        </ul>
    );
};

export default Pagination;
