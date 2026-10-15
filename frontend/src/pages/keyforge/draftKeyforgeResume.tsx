import styles from './draftKeyforgeResume.module.css';
import DraftKeyforgeStats from './draftKeyforgeStats';
import { useState } from 'react';
import { Button } from 'react-bootstrap';

const DraftKeyforgeResume = ({ currentDraftKeyforge, focusSurJoueurAouBforStats, focusSurStat }) => {
    const [statFocus, setStatFocus] = useState(0);
    const draft = currentDraftKeyforge?.[0];
    const etape = draft?.etat;
    const showStats = etape >= 10;
    const statLabels = [etape >= 12 ? 'Pénalités' : 'Progression', 'Types', 'Types par faction', 'Créatures', 'Aombre généré', 'Raretés'];
    const statuts = {
        0: { label: 'Maisons à pick/ban', className: 'txtColorYellow' },
        10: { label: 'Draft prêt', className: 'txtColorGreen' },
        11: { label: 'Draft en cours', className: 'txtColorYellow' },
        12: { label: 'Draft terminé', className: 'txtColorGreen' },
    };
    const statut = statuts[etape] ?? {
        label: etape >= 1 && etape <= 8 ? 'Choix des maisons en cours' : etape === 9 ? 'Génération du pool' : '---',
        className: 'txtColorYellow',
    };
    const formatDate = (value) => value ? new Date(value).toLocaleDateString('fr-FR') : '---';
    const renderFactions = (player: number) => (
        <div className={styles.factions}>
            {['A', 'B', 'C'].map(faction => (
                <img key={faction}
                    src={draft?.[`lienImg${faction}J${player}`] || '/images/keyforge/NC.png'}
                    alt={`Logo de la faction ${faction} du joueur ${player}`}
                    className={styles.logoFaction} />
            ))}
        </div>
    );

    return (
        <div className={`mb-4 ${styles.EnteteDraft}`}>
            <h4 className={`text-center txtColorWhite ${styles.title}`}>{draft?.titre ?? '---'}</h4>
            <div className={`${styles.summaryLayout} ${!showStats ? styles.summaryWithoutStats : ''}`}>
                <dl className={styles.draftDetails}>
                    <dt>Date de création</dt>
                    <dd className="txtColorWhite">{formatDate(draft?.dateCreation)}</dd>
                    <dt>Date de mise à jour</dt>
                    <dd className="txtColorWhite">{formatDate(draft?.dateDerModif)}</dd>
                    <dt>Joueur A</dt>
                    <dd className="txtColorPlayerRed">{draft?.pseudoJ1 ?? '---'}</dd>
                    <dt>Maisons joueur A</dt>
                    <dd>{renderFactions(1)}</dd>
                    <dt>Joueur B</dt>
                    <dd className="txtColorPlayerBlue">{draft?.pseudoJ2 ?? '---'}</dd>
                    <dt>Maisons joueur B</dt>
                    <dd>{renderFactions(2)}</dd>
                    <dt>Set</dt>
                    <dd className="txtColorWhite">{draft ? `${draft.libelle ?? '---'} (${draft.numero ?? '---'})` : '---'}</dd>
                    <dt>Anomalies</dt>
                    <dd className="txtColorWhite">{draft ? (draft.avecAnomalies ? 'Avec' : 'Sans') : '---'}</dd>
                    <dt>Avancement</dt>
                    <dd className={statut.className}>{statut.label}</dd>
                </dl>
                {showStats && <>
                    <div className={styles.statsPanel}>
                        <DraftKeyforgeStats currentDraft={currentDraftKeyforge} statistiqueFocus={statFocus} />
                    </div>
                    <div className={styles.statsControls} role="group" aria-label="Statistiques du draft">
                        {statLabels.map((label, index) => (
                            <Button key={index}
                                className={`btn btn-primary ${statFocus === index ? 'btn-ColorFFocused' : 'btn-ColorF'}`}
                                aria-pressed={statFocus === index}
                                onClick={() => setStatFocus(index)}>
                                {label}
                            </Button>
                        ))}
                    </div>
                </>}
            </div>
        </div>
    );
};

export default DraftKeyforgeResume;
