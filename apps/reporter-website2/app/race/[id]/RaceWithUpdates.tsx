'use client';

import { supabase } from '../../../utils/supabase';
import { useEffect, useState } from 'react';

function RaceWithUpdates({ serverRace }) {
  const [race, setRace] = useState(serverRace);
  useEffect(() => {
    const sub = supabase.channel('raceUpdates').on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'competitions',
        filter: `id=eq.${serverRace.id}`
      },
      (payload) => {
        console.log('payload', payload)
        setRace(payload.new);
      }
    ).subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [serverRace.id]);

  return <pre>{JSON.stringify(race, null, 2)}</pre>;
}

export default RaceWithUpdates;
