import { nextTick } from 'process';
import React from 'react';
import { AxisOptions, Chart } from 'react-charts';
import { Competitor, GraphData, GraphDataData, Lane } from './app';

const nep = [
  {
    label: 'lap 1',
    data: [
      // contains skaters who have skated this lap
      {
        competitor: 'Gillian',
        laps: 1,
      },
      {
        competitor: 'Silly',
        laps: 1,
      },
      {
        competitor: 'Sandi',
        laps: 1,
      },
    ],
  },
  {
    label: 'lap 2',
    data: [
      // contains skaters who have skated this lap
      {
        competitor: 'Gillian',
        laps: 1,
      },
      {
        competitor: 'Silly',
        laps: 1,
      },
      {
        competitor: 'Sandi',
        laps: 1,
      },
    ],
  },
  {
    label: 'lap 3',
    data: [
      // contains skaters who have skated this lap
      {
        competitor: 'Gillian',
        laps: 1,
      },
      {
        competitor: 'Silly',
        laps: 1,
      },
    ],
  },
  {
    label: 'lap 4',
    data: [
      // contains skaters who have skated this lap
      {
        competitor: 'Gillian',
        laps: 1,
      },
    ],
  },
  {
    label: 'lap 5',
    data: [
      // contains skaters who have skated this lap
      {
        competitor: 'Gillian',
        laps: 1,
      },
    ],
  },
];

export default function BarHorizontalStacked({ data }: { data: GraphData }) {
  const primaryAxis = React.useMemo<AxisOptions<GraphDataData>>(
    () => ({
      position: 'left',
      getValue: (datum) => datum.competitor,
    }),
    []
  );

  const secondaryAxes = React.useMemo<AxisOptions<GraphDataData>[]>(
    () => [
      {
        position: 'bottom',
        getValue: (datum) => datum.laps,
        stacked: true,
        showGrid: true,
        tickCount: data.length,
        showDatumElements: false,
      },
    ],
    []
  );

  return (
    <Chart
      className="text-9xl"
      options={{
        data,
        primaryAxis,
        secondaryAxes,
        tooltip: false,
      }}
    />
  );
}
