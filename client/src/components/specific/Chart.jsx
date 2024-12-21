import React from 'react'
import { Line, Doughnut } from "react-chartjs-2"

import {
    Chart as ChartJS,
    CategoryScale,
    Tooltip,
    Filler,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Legend,
    plugins,
    scales,
} from "chart.js"
import { BorderColor } from '@mui/icons-material'
import { orangeLight, purple, purpleLight } from '../constants/color'
import { getlast7Days } from '../../lib/features'
import { orange } from '@mui/material/colors'



ChartJS.register(
    CategoryScale,
    Tooltip,
    Filler,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Legend,
)

const labels = getlast7Days()

const LineChartOptions = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: false,
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            }
        },
        y: {
            beginAtZero: true,
            grid: {
                display: false,
            }
        }
    }
}

const LineChart = ({value = []}) => {

    const data = {
        labels,
        datasets: [
            {
                data: value,
                label: "Messages",
                fill: true,
                backgroundColor: purpleLight,
                borderColor: purple,
            },
        ]
    }

    return (
        <Line data={data} options={LineChartOptions} />
    )
}


const doughnutChartOptions = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: false,
        },
    },
    cutout: 120
}

const DoughnutChart = ({value = [], labels = []}) => {

    const data = {
        labels,
        datasets: [
            {
                data: value,
                label: "Total Chats vs Group Chats",
                fill: true,
                backgroundColor: [purpleLight, orangeLight],
                borderColor: [purple, "orange"],
                hoverBackgroundColor: [purple, "orange"],
                offset: 40
            },
        ]
    }

    return (
        <Doughnut style={{zIndex: 10}} data = {data} options={doughnutChartOptions} />
    )
}

export { LineChart, DoughnutChart }