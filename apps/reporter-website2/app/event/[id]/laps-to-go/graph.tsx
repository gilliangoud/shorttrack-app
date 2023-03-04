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
        stacked: false,
        ticks: {
          font: {
            size: 32
          }
        }
      },
      y: {
        stacked: false,
        ticks: {
          beginAtZero: true,
          stepSize: 1,
          min: 0,
          max: 13,
        },
      },
    },
  };

  const createLabels = () => {
    const laness = lanes.filter((c) => c.raceId === race.id)
    .sort((a,b) => a.id - b.id)
    const laneids = laness.map((l) => l.competitorId)
    const competitorids = lanes.map((l) => competitors.find((c) => c.id === l.competitorId)?.helmet_id)
    return competitorids
  }

  const createGraphdata = () => {
    const laps = Math.round(race.distance/race.track)
    const colors = ['rgb(255, 99, 132)', 'rgb(75, 192, 192)', 'rgb(255, 205, 86)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)', 'rgb(201, 203, 207)']
    const graphdata = []
    for (let i = 1; i <= laps; i++) {
      const data = []
      lanes.filter((c) => c.raceId === race.id)
        .sort((a,b) => a.id - b.id).map((lane) => {
          // const comp = competitors.find((c) => c.id === lane.competitorId)
          return lane.passings?.length >= i ? 1 : 0
        })
      graphdata.push({
        label: `Lap ${i}`,
        data: data,
        backgroundColor: colors[(i-1) % 5],
      })
    }
    console.log(graphdata)
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
