import { createClient } from '@supabase/supabase-js';
import { Database } from '@shorttrack-app/st-app-db';
import { environment } from '../environments/environment';
import RacesList from './nextRaces';
import PreviousRaces from './previousRaces';
import { useEffect, useState } from 'react';
import en from 'javascript-time-ago/locale/en.json';
import TimeAgo from 'javascript-time-ago';
import RollingTime from './rollingTime';
TimeAgo.addDefaultLocale(en);

const supabase = createClient<Database>(
  environment.supabaseUrl,
  environment.supabaseKey
);

export type Race = Database['public']['Tables']['races']['Row'];
type Passing = Database['public']['Tables']['passings']['Row'];
type Transponder = Database['public']['Tables']['transponders']['Row'];
export type Lane = Database['public']['Tables']['lanes']['Row'];
export type Start = Database['public']['Tables']['starts']['Row'];
export type Competitor = Database['public']['Tables']['competitors']['Row'];
type Competition = Database['public']['Tables']['competitions']['Row'];

export function App() {
  // const competitors = new Map<number, Competitor>();
  // const [previousRaces, setPreviousRaces] = useState<{race: Race, lanes: Lane[]}[]>([])
  // const [nextRaces, setNextRaces] = useState<{race: Race, lanes: Lane[]}[]>([])
  const [previousRaces, setPreviousRaces] = useState<Race[]>([]);
  const [nextRaces, setNextRaces] = useState<Race[]>([]);
  const [lanes, setLanes] = useState<Lane[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [starts, setStarts] = useState<Start[]>([]);

  const fetchRaces = async () => {
    const { data, error } = await supabase
      .from('races')
      .select('*')
      .eq('competition', 1)
      .order('id', { ascending: true });
    if (data) {
      setPreviousRaces(
        // sort by armed, then by start_id, so races that are run out of inteded order are show logically
        data.filter((x) => x.armed === true || x.start_id != null).sort((a, b) => {
          return (b.start_id || 0) - (a.start_id || 1)
        })
      );
      setNextRaces(data.filter((x) => x.armed === false && x.start_id == null));
      console.log('fetched races');
    }
    if (error) {
      console.log('error', error);
    }
  };

  const fetchLanes = async () => {
    const { data, error } = await supabase
      .from('lanes')
      .select('*')
      .order('id', { ascending: true });
    if (data) {
      setLanes(data);
      console.log('fetched lanes');
    }
    if (error) {
      console.log('error', error);
    }
  };

  const fetchCompetitors = async () => {
    const { data, error } = await supabase
      .from('competitors')
      .select('*')
      .eq('competition_id', 1)
      .order('id', { ascending: true });
    if (data) {
      setCompetitors(data);
      console.log('fetched competitors');
    }
    if (error) {
      console.log('error', error);
    }
  };

  const fetchStarts = async () => {
    const { data, error } = await supabase
      .from('starts')
      .select('*')
      .gt(
        'inserted',
        new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString()
      ) // only get records from latest 24 hours
      .order('id', { ascending: true });
    if (data) {
      setStarts(data);
      console.log('fetched starts', data);
    }
    if (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    fetchLanes();
    fetchCompetitors();
    fetchRaces();
    fetchStarts();
    const subscription = supabase
      .channel('public:races')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: `races`,
        },
        (payload) => {
          fetchRaces();
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
          // updates lanes array
          const updatedLane = payload.new as Lane;
          setLanes((lanes) => {
            const newLanes: Lane[] = [...lanes];
            const index = newLanes.findIndex((x) => x.resultsRef === updatedLane.resultsRef);
            if (index === -1) {
              newLanes.push(payload.new as Lane);
            } else {
              newLanes[index] = updatedLane;
            }
            return newLanes;
          });
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
          // updates starts array
          const updatedStart = payload.new as Start;
          setStarts((starts) => {
            const newStarts: Start[] = [...starts];
            const index = newStarts.findIndex((x) => x.id === updatedStart.id);
            if (index === -1) {
              newStarts.push(payload.new as Start);
            } else {
              newStarts[index] = updatedStart;
            }
            return newStarts;
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="h-screen overflow-hidden">
      <div className="flex h-12 bg-gray-300 justify-between items-center px-6">
        <p className="text-xl text-center align-middle">
          Live UNOFFICIAL results
        </p>
        <p className="text-xl text-center align-middle hidden sm:block">
          2023 Special Olympics BC Winter Games
        </p>
        <p className="text-left w-48 hidden lg:block">
          <RollingTime text="" />
        </p>
      </div>
      <div className="flex h-full">
        <div className="flex flex-col h-full md:border-r-4 w-full md:w-1/2 overflow-hidden">
          <PreviousRaces
            races={previousRaces}
            lanes={lanes}
            starts={starts}
            competitors={competitors}
          />
        </div>
        <div className="flex flex-col h-screen md:border-l-4 md:block hidden md:w-1/2 overflow-hidden">
          <RacesList
            races={nextRaces}
            lanes={lanes}
            competitors={competitors}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
