import { Modal, Button } from 'react-bootstrap';
import { useState, useEffect, useRef } from 'react';
import { useSessionUserContext } from '../contexts/sessionUserContext';
import { useOngletAlerteContext } from '../contexts/ToastContext';
import styles from './CreateNewDraftKeyforge.module.css';
import convertDateToDateLong from '../../functions/getDateLong';
import InputStandard from '../../components/inputs/InputStandard';
import useApiFetch from "../../api/useApiFetch";

interface KeyforgeSet {
    id: string;
    numero: number;
    libelle: string;
    selected?: boolean;
}

  const FormNewDraftKeyforge = ({ handleClose, show, handleRefresh}) => {
    const { showOngletAlerte } = useOngletAlerteContext();
    const {sessionUser} = useSessionUserContext();
    const inputsRef = useRef({});
    const [IDSetSelected, setIDSetSelected] = useState<string | null>(null);
    const [unlockBtnValiderCreateNewDraft, setUnlockBtnValiderCreateNewDraft] = useState(false);
    const [loadingSet, setLoadingSet] = useState(false);
    const { callApiFetch } = useApiFetch();
    const [listeSets, setListeSets] = useState<KeyforgeSet[]>([]);

    useEffect(() => {
        const fetchSets = async () => {
            const data = await callApiFetch<KeyforgeSet[]>(
                '/api/keyforge/sets',
                'Erreur récupération de la liste des sets',
                setLoadingSet,
                { method: 'GET' }
            );

            if (data) {
                setListeSets(data);
            }
        };

        fetchSets();
    }, []);


    const handleClickOnSet = (codeSet: string) => {
        setListeSets(prevListeSets =>
            prevListeSets.map(currentSet =>
                currentSet.id === codeSet
                    ? {
                        ...currentSet,
                        selected: true
                    }
                    : {
                        ...currentSet,
                        selected: false
                    }
            )
        );

        setIDSetSelected(codeSet);
        setUnlockBtnValiderCreateNewDraft(true);
    };

    const handleCreateNewDraft = async () => {
        const dateNow = new Date();
        const dateFormated = convertDateToDateLong(dateNow);
        const result = await callApiFetch(
            '/api/keyforge/creationNewDraft',
            'Erreur lors de la création du draft KeyForge',
            undefined,
            {
                method: 'POST',
                body: JSON.stringify({
                    parID: sessionUser.id.toString() + "-" + dateFormated,
                    parJoueurA: inputsRef?.current["pseudoJoueurA"]?.value || "Joueur A",
                    parJoueurB: inputsRef?.current["pseudoJoueurB"]?.value || "Joueur B",

                    parPresenceAnomalies:
                        inputsRef?.current["checkAvecAnomalies"]?.checked ?? false,

                    parSet: IDSetSelected,
                    parDateCreation: dateNow,
                    parDateMaj: dateNow,
                    parTitreDraft: inputsRef?.current["titreDraft"]?.value || "(sans nom)",
                    parEtat: 0
                })
            }
        );

        if (!result) {
            return;
        }

        showOngletAlerte(
            'success',
            '(Création draft)',
            '',
            `Le nouveau draft KeyForge "${inputsRef?.current["titreDraft"]?.value || "(sans nom)"}" a bien été créé !`
        );

        handleClose(false);

        setListeSets(prevListeSets =>
            prevListeSets.map(currentSet => ({
                ...currentSet,
                selected: false
            }))
        );

        setUnlockBtnValiderCreateNewDraft(false);
        handleRefresh(prev => [
            ...prev,
            {
                id: sessionUser.id.toString() + "-" + dateFormated,
                titre: inputsRef?.current["titreDraft"]?.value || "(sans nom)",
                avecAnomalies: inputsRef?.current["checkAvecAnomalies"]?.checked,
                dateCreation: dateNow,
                dateDerModif: dateNow,
                etat: 0,
                pseudoJ1: inputsRef?.current["pseudoJoueurA"]?.value || "Joueur A",
                pseudoJ2: inputsRef?.current["pseudoJoueurB"]?.value || "Joueur B",
                setID: IDSetSelected,
                idSet: IDSetSelected
            }
        ]);

        setIDSetSelected(null);
    };

    return (
    <Modal show={show} onHide={() => handleClose(false)} centered>
      <Modal.Header closeButton className={`${styles.borderTop} bgcolorC modalTopBordBotTransparent`}>
        <Modal.Title className="txtColorWhite">Création d'un nouveau draft</Modal.Title>
      </Modal.Header>

      <Modal.Body className={`bgcolorC ${styles.borderMid}`}>
            <div id="formCreateNewDraft">
                <div className="row">             
                    <div className="col-12 mt-3 d-flex justify-content-center">
                            <h6 className="text-center txtColorWhite">Nom du draft</h6>
                    </div>
                </div>
                <div className="row">             
                    <div className="col-12 mt-2 d-flex justify-content-center">
                        <InputStandard strType={"text"} intMaxLength={40} strPlaceholder={"Nom du draft"} strValeurByDef={""} strID={"titreDraft"} strTxtAlign="center" ref={(e) => {inputsRef.current["titreDraft"] = e;}}/>
                    </div>
                </div>
                <div className="row">             
                    <div className="col-12 mt-4 d-flex justify-content-center">
                        <h6 className="text-center txtColorWhite">Pseudos</h6>
                    </div>
                </div>
                <div className="row">             
                    <div className="col-12 col-lg-6 offset-lg-3 mt-2 d-flex justify-content-center">
                        <InputStandard strType={"text"} strColor={"var(--txtColorPlayerRed)"} intMaxLength={50} strPlaceholder={"Joueur A"} strValeurByDef={""} strID={"pseudoJoueurA"} strTxtAlign="center" ref={(e) => {inputsRef.current["pseudoJoueurA"] = e;}}/>
                    </div>
                </div>
                <div className="row">             
                    <div className="col-12 col-lg-6 offset-lg-3 mt-2 d-flex justify-content-center">
                        <InputStandard strType={"text"} strColor={"var(--txtColorPlayerBlue)"} intMaxLength={50} strPlaceholder={"Joueur B"} strValeurByDef={""} strID={"pseudoJoueurB"} strTxtAlign="center" ref={(e) => {inputsRef.current["pseudoJoueurB"] = e;}}/>
                    </div>
                </div>
                <div className="row">             
                    <div className="col-12 mt-3 d-flex justify-content-center">
                        <h6 className="mt-4 text-center txtColorWhite">Sélectionnez un set...</h6>
                    </div>
                </div>
                <div className="row">             
                    <div className="col-12 d-flex justify-content-center">
                        <div className="p-3">
                            <div className={`list-group ${styles.shadow}`}>
                                {listeSets?.map((current, index) => (
                                    <button type="button" key={index} className={`list-group-item list-group-item-action text-center ${!current.selected ? styles.bandeauTag : styles.bandeauTagFocus}`} onClick={() => handleClickOnSet(current.id)}>Set {current.numero} : {current.libelle}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">             
                    <div className="col-12 mt-3 d-flex justify-content-center">
                        <div className="mb-3 form-check">
                            <input type="checkbox" className="form-check-input" id="checkAvecAnomalies" ref={(e) => {inputsRef.current["checkAvecAnomalies"] = e;}}></input>
                            <label className="form-check-label txtColorWhite" htmlFor="checkAvecAnomalies">Inclure la possibilité d'anomalies</label>
                        </div>
                    </div>
                </div>
            </div>
      </Modal.Body>

      <Modal.Footer className={`${styles.LoginModalBot} ${styles.borderBottom}`}>         
            <div className="col-12 d-flex justify-content-center">
                <Button disabled={!unlockBtnValiderCreateNewDraft} className={`btn btn-primary ${unlockBtnValiderCreateNewDraft ? "btn-ColorA" : "btn-ColorInactif"}`} onClick={() => handleCreateNewDraft()}>
                    Créer le draft
                </Button>
            </div>
      </Modal.Footer>
    </Modal>
  );
};

export default FormNewDraftKeyforge;