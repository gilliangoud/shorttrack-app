'use client';

import { supabase } from '../../../../utils/supabase';
import { useEffect, useRef, useState } from 'react';
import TimeSinceRolling from './timeSinceRolling';
import autoAnimate from '@formkit/auto-animate';

function Realtime({
  serverRaces,
  serverLanes,
}: {
  serverRaces: any[];
  serverLanes: any[];
}) {
  const [races, setRaces] = useState([...serverRaces]);
  const [lanes, setLanes] = useState([...serverLanes]);
  const [competitors, setCompetitors] = useState([]);
  const [starts, setStarts] = useState([]);

  const parent = useRef(null);

  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  useEffect(() => {
    supabase
      .from('competitors')
      .select()
      .in(
        'id',
        lanes.map((lane) => lane.competitorId)
      )
      .then(({ data }) => {
        setCompetitors(data);
      });
  }, [lanes]);

  useEffect(() => {
    supabase
      .from('lanes')
      .select()
      .in(
        'raceId',
        races.map((r) => r.id)
      )
      .then(({ data }) => {
        setLanes(data);
      });
  }, [races]);

  useEffect(() => {
    const sub = supabase
      .channel('raceUpdatesLive')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'races',
        },
        (payload) => {
          // if the race has gotten a startID, add it to the starts array
          if (payload.new.startId && payload.old.startId === null) {
            supabase
              .from('starts')
              .select()
              .eq('id', payload.new.startId)
              .then(({ data }) => {
                setStarts([data, ...starts]);
              });
          }
          // add to array if not already there or update if already there
          if (races.findIndex((r) => r.id === payload.new.id) === -1) {
            setRaces([payload.new, ...races]);
          } else {
            setRaces(
              races.map((item) =>
                item.id === payload.new.id ? payload.new : item
              )
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lanes',
        },
        (payload) => {
          // add to array if not already there or update if already there
          if (
            lanes.findIndex(
              (r) => r.id === payload.new.id && r.raceId === payload.new.raceId
            ) === -1
          ) {
            setLanes([payload.new, ...races]);
          } else {
            setLanes(
              lanes.map((item) =>
                item.id === payload.new.id && item.raceId === payload.new.raceId
                  ? payload.new
                  : item
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  if (races == undefined) {
    return <>...waiting</>;
  }

  return (
    // <div>
    //   {/* {JSON.stringify(competitors, null, 2)} */}
    //   {races
    //     .filter((r) => r.armed)
    //     .map((race) => (
    //       <div key={race.id}>
    //         {/* Big table with race info */}

    //       </div>
    //     ))}
    // </div>
    <div className='overflow-hidden'>
      {races
        .filter((r) => r.armed)
        .map(
          (race: {
            armed: boolean;
            competition: number;
            created_at: string;
            distance: number;
            id: number;
            name: string;
            pat_id: number;
            program_name: string;
            start_id: number;
            track: number;
            updated_at: string;
          }) => (
            <div className="bg-slate-900 py-10 h-screen w-screen overflow-hidden" key="race.id">
              <div className="px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                  <div className="sm:flex-auto">
                    <h1 className="text-7xl font-semibold leading-6 text-white text-center">
                      {race.name}: {race.program_name}
                    </h1>
                    <p className="mt-2 text-4xl text-gray-300"></p>
                  </div>
                </div>
                <div className="mt-8 flow-root mb-auto">
                  <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead>
                          <tr>
                            <th
                              scope="col"
                              className="py-3.5 pl-4 pr-3 text-left text-4xl font-semibold text-white sm:pl-0"
                            >
                              Helmet
                            </th>
                            <th
                              scope="col"
                              className="py-3.5 px-3 text-left text-4xl font-semibold text-white"
                            >
                              Name
                            </th>
                            <th
                              scope="col"
                              className="py-3.5 px-3 text-left text-4xl font-semibold text-white"
                            >
                              Time
                            </th>
                            <th
                              scope="col"
                              className="py-3.5 px-3 text-left text-4xl font-semibold text-white"
                            >
                              Finish
                            </th>
                          </tr>
                        </thead>
                        <tbody
                          className="divide-y divide-gray-800"
                          ref={parent}
                        >
                          {lanes
                            .filter((c) => c.raceId === race.id)
                            .sort(sortLanes)
                            .map(
                              (lane: {
                                competitorId: number;
                                created_at: string;
                                finish_position: number;
                                id: number;
                                passings: string[];
                                raceId: number;
                                resultsRef: number;
                                time: string;
                                updated_at: string;
                              }) => (
                                <tr key={lane.id}>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-7xl font-semibold text-white sm:pl-0">
                                    {
                                      competitors.find(
                                        (c) => c.id === lane.competitorId
                                      )?.helmet_id
                                    }
                                  </td>
                                  <td className="whitespace-nowrap py-4 px-3 text-7xl text-gray-300 text-clip">
                                    {
                                      competitors.find(
                                        (c) => c.id === lane.competitorId
                                      )?.first_name
                                    }{' '}
                                    {
                                      competitors.find(
                                        (c) => c.id === lane.competitorId
                                      )?.last_name
                                    }
                                  </td>
                                  <td className="whitespace-nowrap py-4 px-3 text-7xl text-gray-300">
                                    {lane.time
                                      ? lane.time
                                      : generateLaptime(
                                          lane.passings,
                                          starts.find(
                                            (x) => x.id === race.start_id
                                          )?.time
                                        )}
                                  </td>
                                  <td className="whitespace-nowrap py-4 px-3 text-7xl text-gray-300">
                                    {lane.finish_position}
                                  </td>
                                </tr>
                              )
                            )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="text-center text-white text-7xl mt-8">
                  {race.start_id ? (
                    <TimeSinceRolling
                      date={
                        starts.find((x) => x.id === race.start_id)?.time || ''
                      }
                      text="Started:"
                      className="w-40"
                    />
                  ) : (
                    ''
                  )}
                </div>
              </div>
            </div>
          )
        )}
    </div>
  );
}

const generateLaptime = (passings: string[], start: string): string => {
  if (passings.length === 0) {
    // no passings
    return '';
  }
  if (passings.length === 1) {
    // one passing, return time since start
    return millisToLapTime(
      new Date(passings[0]).getTime() - new Date(start).getTime()
    );
  }
  if (passings.length > 1) {
    // multiple passings, return time between passings
    return millisToLapTime(
      new Date(passings[passings.length - 1]).getTime() -
        new Date(passings[passings.length - 2]).getTime()
    );
  }
};

const millisToLapTime = (millis: number): string => {
  Math.abs(millis);
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);
  const milliseconds = ((millis % 60000) % 1000).toFixed(0);
  return `${minutes > 0 ? minutes + ':' : ''}${seconds}.${milliseconds}`;
};

const sortLanes = (a, b) => {
  if (b.passings.length !== a.passings.length) {
    return b.passings.length - a.passings.length;
  }

  // If the number of passings are equal, sort by earliest occurring passing time
  const aTime = a.passings.length > 0 ? new Date(a.passings[0]) : null;
  const bTime = b.passings.length > 0 ? new Date(b.passings[0]) : null;
  if (aTime && bTime) {
    return aTime.getTime() - bTime.getTime();
  } else if (aTime) {
    return -1;
  } else if (bTime) {
    return 1;
  }

  // If there are no passings, sort by ID
  return a.id - b.id;
};

export default Realtime;
