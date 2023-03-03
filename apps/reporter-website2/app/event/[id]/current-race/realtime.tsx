'use client';

import { supabase } from '../../../../utils/supabase';
import { useEffect, useState } from 'react';
import { laneSort } from 'apps/reporter-website2/utils/sort';

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
      .channel('raceUpdatesLive')
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
          if (lanes.findIndex((r) => r.id === payload.new.id && r.raceId === payload.new.raceId) === -1) {
            setLanes([payload.new, ...races]);
          } else {
            setLanes(
              lanes.map((item) =>
                item.id === payload.new.id && item.raceId === payload.new.raceId ? payload.new : item
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
          <div key={race.id}>
            {/* Big table with race info */}
          </div>
        ))}
    </div>
  );
}

export default Realtime;
