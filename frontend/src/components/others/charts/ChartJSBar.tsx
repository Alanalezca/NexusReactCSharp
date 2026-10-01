import styles from './ChartJSBar.module.css';

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

interface ChartJSBarProps {
    labels: string[];
    values: number[];
    colors: string[];
    title: string;
    labelTitreData: string;
}

const ChartJSBar = ({
    labels,
    values,
    colors,
    title,
    labelTitreData
}: ChartJSBarProps) => {

    const data = {
        labels,
        datasets: [
            {
                label: labelTitreData,
                data: values,
                backgroundColor: colors,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                position: "top" as const,

                labels: {
                    color: "white",

                    generateLabels: (chart: any) => {
                        const dataset = chart.data.datasets[0];

                        return chart.data.labels.map(
                            (label: string, index: number) => ({
                                text: `${label} : ${dataset.data[index]}`,
                                fillStyle: dataset.backgroundColor[index],
                                strokeStyle: dataset.backgroundColor[index],
                                fontColor: "white",
                                index
                            })
                        );
                    }
                }
            },

            title: {
                display: true,
                text: title,
                color: "white"
            },
        },

        scales: {
            x: {
                ticks: {
                    color: "white"
                }
            },

            y: {
                beginAtZero: true,

                ticks: {
                    stepSize: 1,
                    color: "white"
                }
            }
        }
    };

    return (
        <div className={styles.chartContainer}>
            <Bar
                data={data}
                options={options}
            />
        </div>
    );
};

export default ChartJSBar;