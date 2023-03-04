'use client';

import { supabase } from '../../../../utils/supabase';
import { useEffect, useState } from 'react';
import Graph from './graph';

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
      .channel('raceUpdates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'races',
        },
        (payload) => {
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
            setLanes([payload.new, ...lanes]);
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
    <div>
      {/* {JSON.stringify(competitors, null, 2)} */}
      {races
        .filter((r) => r.armed)
        .map((race) => (
          <div key={race.id} className="text-9xl">
            {/* <Graph race={race} lanes={lanes} competitors={competitors} /> */}
            {lanes
              .filter((c) => c.raceId === race.id)
              .sort((a, b) => a.id - b.id)
              .map((lane) => (
                <>
                  <h1 className="text-9xl" key={lane.id}>
                    Skater{' '}
                    {
                      competitors.find((c) => c.id === lane.competitorId)
                        ?.helmet_id
                    }
                    : {lane.passings.length} Laps
                  </h1>
                </>
              ))}
          </div>
        ))}
    </div>
  );
}

export default Realtime;
