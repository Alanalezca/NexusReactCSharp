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
  const [inputNameUpload, setInputNameUpload] = useState(""); 
  const btnUploadActif = inputNameUpload && inputNameUpload !== "";
  console.log('btnUploadActif', btnUploadActif);
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

  const handleUploadImage = async (
  event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    const filename = inputNameUpload;
    formData.append("image", file);
    formData.append("slug", filename);
    const result = await callApiFetch<{ imageUrl: string }>(
      "/api/uploads/article-image",
      "Erreur lors de l'upload de l'image",
      setLoadingImages,
      {
        method: "POST",
        body: formData,
      }
    );

    if (result) {
      const uploadedUrl = result.imageUrl;
      const uploadedFileName = uploadedUrl.split("/").pop() ?? uploadedUrl;
      const extension = uploadedFileName.includes(".")
        ? `.${uploadedFileName.split(".").pop()}`
        : "";

      const newImage: Images = {
        fileName: uploadedFileName,
        url: uploadedUrl,
        extension,
        sizeBytes: file.size,
        createdAt: new Date().toISOString(),
      };

      setImages((prev) => [newImage, ...prev]);

      showOngletAlerte(
        "success",
        "(Upload image)",
        "",
        `L'image "${filename}" a bien été uploadée !`
      );

      setInputNameUpload("");
      event.target.value = "";
    }
  };

  const getCleanFileName = (fileName: string) => {
    return fileName.includes("$") ? fileName.split("$")[1] : fileName;
  };

  const filterUsed = !!inputSearch?.trim(); 
  console.log('test', filterUsed);
  return (
    <Modal show={show} size="xl" onHide={() => handleClose(false)} centered>
      <Modal.Header closeButton className={`${styles.borderTop} bgcolorC modalTopBordBotTransparent`}>
        <Modal.Title className="txtColorWhite">Gestion des images</Modal.Title>
      </Modal.Header>

      <Modal.Body className={`bgcolorC ${styles.borderMid}`}>
        {loadingImages && <Loader/>}
        <div className="row justify-content-center mb-3">
          <div className="col-12 col-md-6">
            
            <div className="d-flex align-items-center justify-content-center gap-2">
              
              <span
                className={`bx bx-filter ${filterUsed ? 'bxNormalOrangeNoTada' : 'bxNormalGreyNoTada'}`}
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
        <div className="row justify-content-center mb-3">
          <div className="col-12 col-md-6">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <span
                className={`bx bx-image-add ${!btnUploadActif ? "bxNormalOrange" : "bxNormalGreenNoTada"}`}
              ></span>
              <input
                className="input flex-grow-1"
                type="text"
                maxLength={50}
                placeholder="Libellé de l'image"
                value={inputNameUpload}
                onChange={(e) => setInputNameUpload(e.target.value)}
              />
              <label className={`${styles.customUploadButton} ${!btnUploadActif && styles.btnOff}`}>
                Uploader
                <input
                className={styles.inputAsButton}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  hidden
                  disabled={!btnUploadActif}
                />
              </label>
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
            />

            <button
              className={`bx bx-copy ${styles.copyUrlButton}`}
              type="button"
              onClick={() => handleCopyFileName(image.url)}
            />

            <img
              src={getImageUrl(image.url)}
              alt={image.fileName}
              className={styles.miniImg}
            />

            <div className={styles.imageName}>
              {getCleanFileName(image.fileName)}
            </div>
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
