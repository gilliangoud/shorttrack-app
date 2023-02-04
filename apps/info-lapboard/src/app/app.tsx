import { Route, Routes, Link, BrowserRouter } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@shorttrack-app/st-app-db';
import { environment } from '../environments/environment';
import { useEffect, useState } from 'react';
import BarHorizontalStacked from './HorizontalBar';

const supabase = createClient<Database>(
  environment.supabaseUrl,
  environment.supabaseKey
);

export type Race = Database['public']['Tables']['races']['Row'];
export type Passing = Database['public']['Tables']['passings']['Row'];
export type Transponder = Database['public']['Tables']['transponders']['Row'];
export type Lane = Database['public']['Tables']['lanes']['Row'];
export type Start = Database['public']['Tables']['starts']['Row'];
export type Competitor = Database['public']['Tables']['competitors']['Row'];
export type Competition = Database['public']['Tables']['competitions']['Row'];

export type GraphDataData = {
  competitor: string;
  laps: number;
};

export type GraphData = {
  label: string;
  data: GraphDataData[];
}[];

export function App() {
  const [races, setRaces] = useState<Race[]>([]);
  const [lanes, setLanes] = useState<Lane[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [starts, setStarts] = useState<Start[]>([]);

  const fetchRaces = async () => {
    const { data, error } = await supabase
      .from('races')
      .select('*')
      .eq('competition', 1)
      .eq('armed', true)
      .order('id', { ascending: true });
    if (data) {
      console.log('races', data);
      setRaces(data);
      // setLanes([]);
      data.map((x) => {
        // fetchLanes(x.id);
      });
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

  const calcGraphData = () => {
    // big array of arrays, for each race an array of graphdata
    // create array to the size of distance/trackLength
    // label it lap 1, lap 2, lap 3, etc
    // put a data array in it with the skaters that have passed amount of times

    setGraphData(
      races.length > 0
        ? races.map((race) => {
            return Array.from(
              Array(Math.ceil(race.distance / race.track)).keys()
            ).map((x, index) => ({
              label: `Race ${race.name}`,
              data: lanes
                .filter((y) => y.raceId === race.id)
                .map((lane) => {
                  const comp = competitors.find(
                    (c) => c.id === lane.competitorId
                  );
                  return {
                    competitor:
                      comp?.helmet_id?.toString() || `Lane ${lane.id}`,
                    laps: lane.passings.length - index > 0 ? 1 : 0,
                  };
                }),
            }));
          })
        : []
    );
    console.log('grpah', graphData);
  };

  useEffect(() => {
    try {
      fetchCompetitors();
      fetchLanes();
      fetchStarts();
    } catch (error) {
      console.log('error', error);
    } finally {
      fetchRaces();
    }

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
            const index = newLanes.findIndex(
              (x) => x.resultsRef === updatedLane.resultsRef
            );
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

  const [graphData, setGraphData] = useState<GraphData[]>([]);
  useEffect(() => {
    setTimeout(() => {
      calcGraphData();
    }, 100);
  }, [races]);

  return (
    <div className="h-screen overflow-hidden p-8">
      <div className="flex flex-col h-full w-full text-9xl">
        {graphData.length > 0
          ? graphData.map((x: GraphData, index) => {
              return (
                <div key={index} className="h-full w-full inline-block">
                  <p className="text-4xl text-center">{x[0].label}</p>
                  <BarHorizontalStacked
                    key={index}
                    data={x}
                  ></BarHorizontalStacked>
                </div>
              );
            })
          : null}
      </div>
    </div>
  );
}

export default App;

if (import.meta.vitest) {
  // add tests related to your file here
  // For more information please visit the Vitest docs site here: https://vitest.dev/guide/in-source.html

  const { it, expect, beforeEach } = import.meta.vitest;
  let render: any;

  beforeEach(async () => {
    render = (await import('@testing-library/react')).render;
  });

  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(baseElement).toBeTruthy();
  });

  it('should have a greeting as the title', () => {
    const { getByText } = render(
      <BrowserRouter>
        <App />

        {/* START: routes */}
        {/* These routes and navigation have been generated for you */}
        {/* Feel free to move and update them to fit your needs */}
        <br />
        <hr />
        <br />
        <div role="navigation">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/page-2">Page 2</Link>
            </li>
          </ul>
        </div>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                This is the generated root route.{' '}
                <Link to="/page-2">Click here for page 2.</Link>
              </div>
            }
          />
          <Route
            path="/page-2"
            element={
              <div>
                <Link to="/">Click here to go back to root page.</Link>
              </div>
            }
          />
        </Routes>
        {/* END: routes */}
      </BrowserRouter>
    );
    expect(getByText(/Welcome info-lapboard/gi)).toBeTruthy();
  });
}
