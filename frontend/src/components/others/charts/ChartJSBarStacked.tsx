import styles from './ChartJSBarStacked.module.css';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);


/* ===================================
   TYPES
=================================== */

interface ChartJSBarStackedDataset {
    label: string;
    values: number[];
    color: string;
}

interface ChartJSBarStackedProps {
    labels: string[];
    datasets: ChartJSBarStackedDataset[];
    title: string;
}


/* ===================================
   COMPOSANT
=================================== */

const ChartJSBarStacked = ({
    labels,
    datasets,
    title
}: ChartJSBarStackedProps) => {


    /* ===================================
       DONNEES DU GRAPHIQUE
    =================================== */

    const data = {
        labels,

        datasets: datasets.map(currentDataset => ({
            label: currentDataset.label,
            data: currentDataset.values,
            backgroundColor: currentDataset.color,
            borderColor: currentDataset.color,
            borderWidth: 1
        }))
    };


    /* ===================================
       OPTIONS DU GRAPHIQUE
    =================================== */

    const options = {

        responsive: true,
        maintainAspectRatio: false,

        plugins: {

            /* ===================================
               LEGENDE
            =================================== */

            legend: {
                position: "top" as const,

                labels: {
                    color: "white"
                }
            },


            /* ===================================
               TITRE
            =================================== */

            title: {
                display: true,
                text: title,
                color: "white"
            },


            /* ===================================
               TOOLTIP
            =================================== */

            tooltip: {
                enabled: true
            }
        },


        /* ===================================
           AXES
        =================================== */

        scales: {

            x: {

                /*
                    Tous les datasets appartenant
                    à une même catégorie sont empilés.
                */
                stacked: true,

                ticks: {
                    color: "white"
                },

                grid: {
                    color: "rgba(255, 255, 255, 0.08)"
                }
            },

            y: {

                stacked: true,

                beginAtZero: true,

                ticks: {
                    stepSize: 1,
                    color: "white"
                },

                grid: {
                    color: "rgba(255, 255, 255, 0.08)"
                }
            }
        }
    };


    /* ===================================
       RENDU
    =================================== */

    return (
        <div className={styles.chartContainer}>

            <Bar
                data={data}
                options={options}
            />

        </div>
    );
};

export default ChartJSBarStacked;