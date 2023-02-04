import { useState, useRef, useEffect } from 'react'
import autoAnimate from '@formkit/auto-animate'

import { Competitor, Lane, Race, Start } from './app';
import { TimeSince } from './timeSince';
import TimeSinceRolling from './timeSinceRolling';

type Props = {
  races: Race[];
  lanes: Lane[];
  competitors: Competitor[];
  starts: Start[];
};

export default function RacesList(props: Props) {
  const parent = useRef(null)

  useEffect(() => {
    parent.current && autoAnimate(parent.current)
  }, [parent])

  const lapsToGo = (
    passings: string[],
    distance: number,
    trackLength: number
  ): number => {
    const laps = passings.length || 0;
    // const lapsToGo = Math.round(distance / trackLength - laps);
    const lapsToGo = (distance / trackLength - laps);
    return lapsToGo;
  };

  const millisToLapTime = (millis: number): string => {
    Math.abs(millis);
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    const milliseconds = ((millis % 60000) % 1000).toFixed(0);
    return `${minutes > 0 ? minutes + ':' : ''}${seconds}.${milliseconds}`;
  };

  return (
    <ul
      ref={parent}
      className={`divide-y divide-gray-200 h-full scrollbar-hide overflow-y-auto`}
    >
      {props.races.length > 0 ? (
        props.races.map((race) => (
          <li key={race.id} className="">
            <div className="bg-gray-50 px-3 pl-6 py-1 flex justify-between">
              <p className="">
                {race.name} - {race.distance}M({race.track})
              </p>
              {race.armed && race.start_id ? (
                <TimeSinceRolling
                  date={
                    props.starts.find((x) => x.id === race.start_id)?.time || ''
                  }
                  text="Started:"
                  className="w-40"
                />
              ) : (
                ''
              )}
              {race.start_id && !race.armed ? 'Finished' : ''}
              {!race.start_id && race.armed ? <p>Waiting on start</p> : ''}
              <p className="hidden sm:block">
                <TimeSince
                  date={new Date(race.updated_at)}
                  text="Last updated:"
                  timeStyle="exact"
                />
              </p>
            </div>
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-1 text-left text-xs font-semibold text-gray-500 sm:pl-6"
                  >
                    Lane
                  </th>
                  <th
                    scope="col"
                    className="py-1 text-left text-xs font-semibold text-gray-500"
                  >
                    Competitor
                  </th>
                  <th
                    scope="col"
                    className={`py-1 text-left text-xs font-semibold text-gray-500 ${race.armed? '' : 'hidden'}`}
                  >
                    To go
                  </th>
                  <th
                    scope="col"
                    className="py-1 text-left text-xs font-semibold text-gray-500 hidden lg:block"
                  >
                    Last lap
                  </th>
                  <th
                    scope="col"
                    className="py-1 text-left text-xs font-semibold text-gray-500"
                  >
                    Time
                  </th>
                  <th
                    scope="col"
                    className="py-1 text-left text-xs font-semibold text-gray-500"
                  >
                    Finish position
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white ">
                {props.lanes !== undefined ? (
                  props.lanes
                    .filter((x) => x.raceId === race.id)
                    .sort((a, b) => {
                      if (a.finish_position && b.finish_position) {
                        return a.finish_position - b.finish_position;
                      }
                      if (a.finish_position && !b.finish_position) {
                        return -1;
                      }
                      if (!a.finish_position && b.finish_position) {
                        return 1;
                      }
                      return a.id - b.id;
                    })
                    .map((lane) => (
                      <tr key={lane.id}>
                        <td className="whitespace-nowrap px-3 py-2 text-sm lg:text-xl text-gray-800 sm:pl-6">
                          {lane.id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm lg:text-xl text-gray-800">
                          {
                            props.competitors.find(
                              (c) => c.id === lane.competitorId
                            )?.helmet_id
                          }{' '}
                          -{' '}
                          {
                            props.competitors.find(
                              (c) => c.id === lane.competitorId
                            )?.first_name
                          }{' '}
                          {
                            props.competitors.find(
                              (c) => c.id === lane.competitorId
                            )?.last_name
                          }
                          {/* Add the competitors name here later with their helmet number */}
                        </td>
                        <td className={`whitespace-nowrap px-3 py-2 text-sm lg:text-xl text-gray-800 ${race.armed? '' : 'hidden'} `}>
                          {race.start_id ? (lapsToGo(lane.passings, race.distance, race.track) > 0 ? Math.round(lapsToGo(lane.passings, race.distance, race.track)) - 1: "Finished"): lapsToGo(lane.passings, race.distance, race.track).toFixed(1)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm lg:text-xl text-gray-800 lg:flex hidden">
                          {/* only display the latest laptime */}
                          {lane.passings.length > 1
                            ? lane.passings.map((passing) => {
                                const index = lane.passings.indexOf(passing);
                                if (index !== lane.passings.length - 1) return null
                                return millisToLapTime(
                                  Date.parse(passing) -
                                    Date.parse(lane.passings[index - 1])
                                );
                              })
                            : null}
                          {lane.passings.length === 0
                            ? lane.passings.map((passing) => {
                                return millisToLapTime(
                                  Date.parse(passing) -
                                    Date.parse(
                                      props.starts.find(
                                        (x) => x.id === race.start_id
                                      )?.time || ''
                                    )
                                );
                              })
                            : null}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm lg:text-xl text-gray-800">
                          {lane.time}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm lg:text-xl text-gray-800">
                          {lane.finish_position}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td>Loading...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </li>
        ))
      ) : (
        <p className="text-center text-2xl p-6">No Results yet...</p>
      )}
    </ul>
  );
}
