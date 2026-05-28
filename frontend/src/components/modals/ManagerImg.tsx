import { Modal, Button } from 'react-bootstrap';
import { useEffect, useState, useMemo } from 'react';
import { useSessionUserContext } from '../contexts/sessionUserContext';
import { useOngletAlerteContext } from '../contexts/ToastContext';
import styles from './ManagerImg.module.css';
import useApiFetch from "../../api/useApiFetch";
import Loader from '../../components/others/Loader';
import { getImageUrl } from "../../functions/helpers/getImageUrl";

type ManagerImgProps = {
  handleClose: (show: boolean) => void;
  show: boolean;
  handleShowManagerImg: (show: boolean) => void;
};

type Images = {
  fileName: string;
  url: string;
  extension: string;
  sizeBytes: number;
  createdAt: string;
};


const ManagerImg = ({ handleClose, show, handleShowManagerImg}: ManagerImgProps) => {
  const { showOngletAlerte } = useOngletAlerteContext();
  const { login } = useSessionUserContext();
  const [error, setError] = useState("");
  const { callApiFetch } = useApiFetch();
  const [images, setImages] = useState<Images[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [loadingDeleteImage, setLoadingDeleteImage] = useState(false);
  const [inputSearch, setInputSearch] = useState(""); 

  useEffect(() => {
    const pullImages = async () => {
      const result = await callApiFetch<Images[]>(
        "/api/uploads/article-images",
        "Erreur lors du chargement des images",
        setLoadingImages,
        {
          method: "GET"
        }
      );
      
      if (result) {
        setImages(result);
      }
    };

    if (show) {
      pullImages();
    }
  }, [show]);

  const filteredImages = useMemo(() => {
    return images.filter((image) => {
      const search = inputSearch.trim().toLowerCase();

      return (
        image.fileName.toLowerCase().includes(search) ||
        image.extension.toLowerCase().includes(search)
      );
    });
  }, [images, inputSearch]);

  const handleCopyFileName = async (urlFile: string) => {
    try {
      await navigator.clipboard.writeText(urlFile);

      showOngletAlerte(
        "success",
        "(Copie fichier)",
        "",
        `Le chemin de l'image "${urlFile}" a été copié dans le presse papier.`
      );
    } catch (error) {
      console.error("Erreur copie fichier :", error);

      showOngletAlerte(
        "error",
        "(Copie fichier)",
        "",
        `Impossible de copier le chemin de l'image "${urlFile}" dans le presse papier.`
      );
    }
  };

  const handleDeleteImage = async (filename: string) => {
    const filenameClean = filename.includes("$") ? filename.split("$")[1] : filename;
    if (!filename) return;

    await callApiFetch(
      `/api/uploads/article-image/${encodeURIComponent(filename)}`,
      "Erreur lors de la suppression de l'image",
      setLoadingDeleteImage,
      {
        method: "DELETE",
      }
    );

    showOngletAlerte(
      "success",
      "(Suppression image)",
      "",
      `L'image "${filenameClean}" a bien été supprimée !`
    );
    setImages((prev) =>
      prev.filter((img) => img.fileName !== filename)
    );
  }
  console.log(images);
  return (
    <Modal show={show} size="xl" onHide={() => handleClose(false)} centered>
      <Modal.Header closeButton className={`${styles.borderTop} bgcolorC modalTopBordBotTransparent`}>
        <Modal.Title className="txtColorWhite">Gestion des images</Modal.Title>
      </Modal.Header>

      <Modal.Body className={`bgcolorC ${styles.borderMid}`}>
        {loadingImages && <Loader/>}
        <div className="row justify-content-center mb-3">
          <div className="col-12 col-md-6">
            
            <div className="d-flex align-items-center gap-2">
              
              <span
                className={`bx bx-search bxNormalGreyNoTada`}
              ></span>

              <input
                className="input flex-grow-1"
                type="text"
                maxLength={50}
                placeholder="Filtrer"
                value={inputSearch}
                onChange={(e) => setInputSearch(e.target.value)}
              />

            </div>

          </div>
        </div>
        <div className={styles.imageGrid}>
          {filteredImages.map((image) => (
            <div key={image.fileName} className={styles.imageCard}>
              <button
                className={`bx bx-trash ${styles.deleteButton}`}
                type="button"
                onClick={() => handleDeleteImage(image.fileName)}
              >
              </button>
              <button
                className={`bx bx-copy ${styles.copyUrlButton}`}
                type="button"
                onClick={() => handleCopyFileName(image.url)}
              >
              </button>
              <img
                src={getImageUrl(image.url)}
                alt={image.fileName}
                className={styles.miniImg}
              />
            </div>
          ))}
      </div>
      </Modal.Body>

      <Modal.Footer className={`${styles.ModalBot} ${styles.borderBottom}`}>
        <Button variant="primary" className='btn-ColorA' onClick={() => handleClose(false)}>
          Terminer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ManagerImg;
