// flow for data
// if passing is start, attach to ready races
// else try to attach the passing to the corresponding lane (or athlete in the future)
// if passing is more than 5 seconds of the start or a previous passing, attach
// else discard
// if passing is attached and the total laps have been reached, set final time from start to finish

import { createClient } from '@supabase/supabase-js';
import { Database } from '@shorttrack-app/st-app-db';
const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

type Race = Database['public']['Tables']['races']['Row'];
type Passing = Database['public']['Tables']['passings']['Row'];
type Transponder = Database['public']['Tables']['transponders']['Row'];
type Lane = Database['public']['Tables']['lanes']['Row'];
type Start = Database['public']['Tables']['starts']['Row'];

const readyRaces = new Map<number, Race>();
const transponders = new Map<string, Transponder>();
const lanesByRace = new Map<number, Lane[]>();
const starts = new Map<number, Start>();

const attachStart = async (raceId: number, startId: number) => {
  try {
    const { data, error, status } = await supabase
      .from('races')
      .update({
        start_id: startId,
      })
      .eq('id', raceId)
      .single();

    if (data) {
      readyRaces.set(raceId, data);
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error: any) {
    alert(error.message);
  }
};

const sub = supabase
  .channel('public:mylaps')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: `races`,
    },
    (payload) => {
      if (payload.eventType === 'DELETE') {
        readyRaces.delete((payload.old as Race).id);
        return;
      }

      const race = payload.new as Race;
      if (race.armed === true) {
        // check if race is in readyRaces map and add if not
        if ((payload.old as Race).armed === false){
          console.log(`Race ${race.id} was armed`)
        }
        readyRaces.set(race.id, race);
        fetchLanes(race.id);
      } else {
        //check if race is in readyRaces map and remove if so
        const oldRace = payload.old as Race
        if (oldRace.armed === true){
          console.log(`Race ${oldRace.id} stopped capturing`)
        }
        readyRaces.has(oldRace.id) ? readyRaces.delete(oldRace.id) : null;
        lanesByRace.delete(oldRace.id)
      }
    }
  )
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: `passings`,
    },
    (payload) => {
      const passing = payload.new as Passing;
      if (passing.tran_code === '9992') {
        console.log('start happened', passing.time);
        readyRaces.forEach((race) => {
          if (race.start_id == null) {
            console.log('Race received start at', passing.time, race.id);
            attachStart(race.id, passing.id);
          }
        });
      } else {
        readyRaces.forEach((race) => {
          // if race has a start
          if (race.start_id == null) return;

          // and passing is after the start + 4 seconds
          const timeSinceStart =
            new Date(passing.time).getTime() -
            new Date(starts.get(race.start_id)?.time).getTime();
          if (timeSinceStart < 4000) {
            console.log(
              'passing too close to start ',
              passing.tran_code,
              timeSinceStart
            );
            return;
          }

          // and passing is of a known transponder-lane combination
          const lane = transponders.get(passing.tran_code).lane;
          if (typeof lane !== 'number') {
            console.log('passing of unknown lane ', passing.tran_code);
            return;
          }

          // and we still need passings for this lane
          const passingsNeeded = (race.distance / race.track) | 0;
          const laneInRace = lanesByRace
            .get(race.id)
            .find((x) => x.id === lane);
          if (laneInRace == null) {
            console.log(`Lane ${lane} does not exist in race `, race.id);
            return;
          }
          const passingsToNow = laneInRace?.passings;
          if (passingsToNow.length >= passingsNeeded) {
            console.log(`Lane ${lane} has enough passings already `, passing.tran_code);
            return;
          }

          // and passing is far enough after the previous passing (5 seconds) add to lane
          if (passingsToNow.length == 0) {
            console.log(`Lane ${lane} passed first time `, passing.tran_code)
            addPassingToLane(race.id, lane, passing.time);
          } else {
            const lastPassing = passingsToNow.at(-1);
            const timeSinceLastPassing =
              new Date(passing.time).getTime() -
              new Date(lastPassing).getTime();
            if (timeSinceLastPassing < 5000) {
              console.log(`Lane ${lane} passed too soon `, passing.tran_code, timeSinceLastPassing, `ms`);
              return;
            } else {
              addPassingToLane(race.id, lane, passing.time);
            }
          }

          // if enough passings have occurred, set time and finish position
          // accounting for the recently added passing
          if (passingsToNow.length + 1 === passingsNeeded) {
            const finishMillis =
              new Date(passing.time).getTime() -
              new Date(starts.get(race.start_id)?.time).getTime();
            const finishTime = millisToTimeString(finishMillis);
            // calcular finish position
            const finishPosition = lanesByRace.get(race.id).reduce((acc, x) => {
              if (x.time == null) return acc;
              if (x.time < finishTime) return acc + 1;
              return acc;
            }, 1);
            finish(race.id, lane, finishPosition, finishTime);
          }
        });
      }
    }
  )
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: `lanes`,
    },
    (payload) => {
      if (payload.eventType === 'DELETE') {
        const oldLane = payload.old as Lane;
        lanesByRace.set(
          oldLane.raceId,
          lanesByRace.get(oldLane.raceId)?.filter((x) => x.id !== oldLane.id)
        );
        return;
      }
      console.log('lane change');
      const lane = payload.new as Lane;
      fetchLanes(lane.raceId);
    }
  )
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: `starts`,
    },
    (payload) => {
      if (payload.eventType === 'DELETE') {
        const oldStart = payload.old as Start;
        starts.delete(oldStart.id);
        return;
      }

      const start = payload.new as Start;
      starts.set(start.id, start);
    }
  );

const fetchRaces = async () => {
  const { data, error } = await supabase
    .from('races')
    .select('*')
    .eq('armed', true)
    .order('id', { ascending: true });
  if (data) {
    // add to readyRaces map
    data.map((x) => {
      readyRaces.set(x.id, x);
      fetchLanes(x.id);
    });
    console.log('fetched races');
  }
  if (error) {
    console.log('error', error);
  }
};

const fetchTransponders = async () => {
  const { data, error } = await supabase
    .from('transponders')
    .select('*')
    .order('id', { ascending: true });
  if (data) {
    // add to transponders map
    data.map((x) => transponders.set(x.id, x));
    console.log('fetched transponders');
  }
  if (error) {
    console.log('error', error);
  }
};

const fetchLanes = async (raceId: number) => {
  const { data, error } = await supabase
    .from('lanes')
    .select('*')
    .eq('raceId', raceId)
    .order('id', { ascending: true });
  if (data) {
    lanesByRace.set(raceId, data);
    console.log('fetched lanes for race', raceId);
  }
  if (error) {
    console.log('error', error);
  }
};

const fetchStarts = async () => {
  const { data, error } = await supabase
    .from('starts')
    .select('*')
    .order('id', { ascending: true });
  if (data) {
    // add to starts map
    data.map((x) => starts.set(x.id, x));
    console.log('fetched starts');
  }
  if (error) {
    console.log('error', error);
  }
};

const addPassingToLane = async (
  raceId: number,
  laneId: number,
  passing: string
) => {
  const lane = lanesByRace.get(raceId)?.find((x) => x.id === laneId);
  try {
    const { data, error, status } = await supabase
      .from('lanes')
      .update({
        passings: [...lane.passings, passing],
      })
      .eq('id', laneId)
      .eq('raceId', raceId)
      .select();

    if (data) {
      console.log(`lane ${laneId} in race ${raceId} passed at ${passing}`)
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error: any) {
    alert(error.message);
  }
};

const finish = async (
  raceId: number,
  laneId: number,
  finish_position: number,
  time: string
) => {
  try {
    const { data, error, status } = await supabase
      .from('lanes')
      .update({
        finish_position,
        time,
      })
      .eq('id', laneId)
      .eq('raceId', raceId)
      .select();

    if (data) {
      console.log(`Race ${raceId} lane ${laneId} finished ${finish_position} in ${time}`)
    }

    if (error && status !== 406) {
      throw error;
    }
  } catch (error: any) {
    alert(error.message);
  }
};

const millisToTimeString = (millis: number): string => {
  Math.abs(millis);
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);
  const milliseconds = ((millis % 60000) % 1000).toFixed(0);
  return `${minutes}:${seconds}.${milliseconds}`;
};

fetchRaces();
fetchTransponders();
fetchStarts();
sub.subscribe();
