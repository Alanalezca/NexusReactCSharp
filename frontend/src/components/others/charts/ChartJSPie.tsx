import styles from './ChartJSPie.module.css';

import {
    Chart as ChartJS,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

import { Pie } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Title,
    Tooltip,
    Legend
);

interface ChartJSPieProps {
    labels: string[];
    values: number[];
    colors: string[];
    title: string;
}

const ChartJSPie = ({
    labels,
    values,
    colors,
    title
}: ChartJSPieProps) => {

    const data = {
        labels,
        datasets: [
            {
                label: 'Nombre de cartes',
                data: values,
                backgroundColor: colors,
            },
        ],
    };

    const options = {
        responsive: true,

        plugins: {
            legend: {
                position: "top" as const,
                labels: {
                    color: "white"
                }
            },

            title: {
                display: true,
                text: title,
                color: "white"
            }
        }
    };

    return (
        <div className={styles.chartContainer}>
            <Pie
                data={data}
                options={options}
            />
        </div>
    );
};

export default ChartJSPie;