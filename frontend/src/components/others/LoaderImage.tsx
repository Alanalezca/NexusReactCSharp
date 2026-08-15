import { useState } from "react";
import Loader from "./Loader";
import styles from "./LoaderImage.module.css";

interface ImageWithLoaderProps {
    src: string;
    alt?: string;
    className?: string;
    onClick?: () => void;
    onDoubleClick?: () => void;
}

const ImageWithLoader = ({
    src,
    alt = "",
    className,
    onClick,
    onDoubleClick
}: ImageWithLoaderProps) => {

    const [loaded, setLoaded] = useState(false);

    return (
        <div className={styles.imageContainer}>
            {!loaded && (
                <div className={styles.imageLoader}>
                    <Loader />
                </div>
            )}

            <img
                src={src}
                alt={alt}
                className={`${className ?? ""} ${loaded ? styles.loaded : ""}`}
                onLoad={() => setLoaded(true)}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
            />
        </div>
    );
};

export default ImageWithLoader;