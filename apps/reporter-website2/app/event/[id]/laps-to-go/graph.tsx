"use client"
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
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

export default function Graph({race, lanes, competitors}) {
  const [data, setData] = useState({labels: ['1','2'], datasets: []})

  const options = {
    plugins: {
      tooltip: {
        enabled: false,
      },
      title: {
        display: true,
        text: `${race.name} ${race.program_name}`,
        font: {
          size: 32
        }
      },
      legend: {
        display: false,
    },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
        ticks: {
          font: {
            size: 32
          }
        }
      },
      y: {
        stacked: true,
        ticks: {
          beginAtZero: true,
          stepSize: 1,
        },
      },
    },
  };

  const createLabels = () => {
    const laneids = lanes.map((l) => l.competitorId)
    const competitorids = competitors.filter((c) => laneids.includes(c.id)).map((c) => c.helmet_id)
    return competitorids
  }

  const createGraphdata = () => {
    const laps = Math.round(race.distance/race.track)
    const colors = ['rgb(255, 99, 132)', 'rgb(75, 192, 192)', 'rgb(255, 205, 86)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)', 'rgb(201, 203, 207)']
    const graphdata = []
    for (let i = 1; i <= laps; i++) {
      graphdata.push({
        label: `Lap ${i}`,
        data: lanes.map((lane) => {
          const comp = competitors.find((c) => c.id === lane.competitorId)
          return lane.passings.length - i >= 0 ? 1 : 0
        }),
        backgroundColor: colors[(i-1) % 5],
      })
    }
    return graphdata
  }

  useEffect(() => {
    setData({labels: createLabels(), datasets: createGraphdata()})
  }, [race, lanes, competitors])


  return (
    <Bar options={options} data={data} />
  )
}

function generateLapArray(obj) {
  const distance = obj.distance;
  const trackLength = obj.track;
  const numLaps = Math.round(distance / trackLength);
  const lapArray = [];

  for (let i = 1; i <= numLaps; i++) {
    lapArray.push(`Lap ${i}`);
  }

  return lapArray;
}
