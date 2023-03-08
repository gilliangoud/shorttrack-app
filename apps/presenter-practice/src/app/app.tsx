import { createClient } from '@supabase/supabase-js';
import { Database } from '@shorttrack-app/st-app-db';
import { useEffect, useState } from 'react';
import { atom, useAtom } from 'jotai';

const projectURL = import.meta.env.VITE_PUBLIC_SUPABASE_URL || 'https://wuhnbxqejdishfovgtze.supabase.co';
const projectKey = import.meta.env.VITE_PUBLIC_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1aG5ieHFlamRpc2hmb3ZndHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njg4MDM5NzgsImV4cCI6MTk4NDM3OTk3OH0.mXqeA9zlNWTQbVYFlyYbYdCNR8iPSMu86vGZz3nFjso';

const transpondersAtom = atom<
  Database['public']['Tables']['transponders']['Row'][]
>([]);
const passingsAtom = atom<Database['public']['Tables']['passings']['Row'][]>(
  []
);
const skatersAtom = atom<
  Array<{
    name: string;
    lap_time: string;
  }>
>((get) => {
  const skaters: { name: string; lap_time: string }[] = [];
  get(transpondersAtom).forEach(
    (transponder: Database['public']['Tables']['transponders']['Row']) => {
      // get all passings for this transponder sorted from newest to oldest
      const passingsSorted = get(passingsAtom)
        .filter((p) => p.tran_code === transponder.id || p.transponder === '9992' || p.tran_code === '9992')
        .sort(
          (a, b) =>
            new Date(b.time || '').getTime() - new Date(a.time || '').getTime()
        );
      // console.log('for transponder ', transponder.id, ' passings are ', passingsSorted)
      // calculate time between the two latest passings
      const laptime =
        passingsSorted.length > 1
          ? new Date(passingsSorted[0].time || '').getTime() -
            new Date(passingsSorted[1].time || '').getTime()
          : 0;
      skaters.push({
        name: transponder.name || '',
        lap_time: (parseInt(laptime.toString()) / 1000).toFixed(2),
      });
    }
  );
  return skaters;
});

export function App() {
  const [supabase] = useState(createClient<Database>(projectURL, projectKey));
  const ws = new WebSocket("ws://192.168.1.2:8000");
  ws.onopen = (event) => {
    console.log("WebSocket is open now.", event);
  };
  ws.onmessage = function (event) {
    const json: {
      msg: string, // "PASSING",
      decoder_id: string, // "042D84",
      passing_number: number, // 24066,
      rtc_time: string, //"2023-03-07 19:40:26.603",
      time: string, //"2023-03-07 19:40:26.603",
      strength: number, //128,
      hits: number, //65,
      low_battery: boolean, //false,
      resend: boolean, //false,
      modified: boolean, //false,
      gps_locked: boolean, //false,
      tran_code: string, //"TZ-02445",
      sport: number, //2
    } = JSON.parse(event.data);
    console.log(JSON.stringify(json, null, 2))
    try {
      // if ((json.event = "data")) {
      //   setBids(json.data.bids.slice(0, 5));
      // }
      json.time = json.rtc_time;
      setPassings([json as unknown as Database['public']['Tables']['passings']['Row'], ...passings]);
    } catch (err) {
      console.log(err);
    }
  };

  // const [transponders, setTransponders] = useState<
  //   Database['public']['Tables']['transponders']['Row'][]
  // >([]);
  // const [passings, setPassings] = useState<
  //   Database['public']['Tables']['passings']['Row'][]
  // >([]);
  // const [skaters, setSkaters] = useState<{
  //   transponder: string;
  //   name: string;
  //   lap_time: string;
  //   last_passing: string;
  // }>()

  const [transponders, setTransponders] = useAtom(transpondersAtom);
  const [passings, setPassings] = useAtom(passingsAtom);
  const [skaters, setSkaters] = useAtom(skatersAtom);

  // get the initial transponders, passings from the last hour and, subscribe to new passings
  useEffect(() => {
    supabase
      .from('transponders')
      .select('*')
      .then((res) => {
        if (res.error) {
          console.error(res.error);
          return;
        }
        if (res.data) {
          setTransponders(res.data);
        }
      });

    supabase
      .from('passings')
      .select('*')
      .order('time', { ascending: false })
      .limit(20)
      .then((res) => {
        if (res.error) {
          console.error(res.error);
          return;
        }
        if (res.data) {
          setPassings(res.data);
          console.log('set passings', res.data, passings);
        }
      });

    const subscription = supabase
      .channel('practice')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: `passings`,
        },
        (payload) => {
          // if (passings.findIndex((p) => p.time === payload.new.time) > -1) return;
          console.log('new passing', payload.new);
          console.log('passings before', passings);
          setPassings((prev) => [
            payload.new as Database['public']['Tables']['passings']['Row'],
            ...prev,
          ]);
          console.log('skaters', skaters);
          console.log('passings after', passings);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addPassing = () => {
    setPassings((prev) => {
      console.log('passings changed', prev);
      return [
        {
          msg: "PASSING",
          decoder_id: "042D84",
          passing_number: 24066,
          rtc_time: "2023-03-07 19:40:26.603",
          time: "2023-03-07 20:55:26.603",
          strength: 128,
          hits: 65,
          low_battery: false,
          resend: false,
          modified: false,
          gps_locked: false,
          tran_code: "TZ-02445",
          sport: 2,
        } as unknown as Database['public']['Tables']['passings']['Row']
        ,...prev];
    });}

  return (
    <>
      <ul className="h-screen bg-gray-900 space-y-2 overflow-y-scroll flex flex-wrap justify-evenly">
        {skaters
          .filter((s) => s.lap_time !== '0.00')
          .map((item) => {
            return (
              <li
                key={item.name}
                className="w-3/12 min-w-fit flex-grow-0 overflow-hidden m-1 max-h-56 bg-slate-800 px-4 py-2 shadow sm:rounded-md"
              >
                <div className="flex space-x-1 overflow-clip -my-8">
                  <p className="flex-1 text-clip text-5xl object-fit object-scale-down self-center font-medium tracking-tight text-gray-300">
                    {item.name}
                  </p>
                  <p className="self-center text-[10em] font-bold tracking-tight text-white text-right">
                    {item.lap_time}
                  </p>
                </div>
              </li>
            );
          })}
      </ul>
      <button
        onClick={() => {
          addPassing();
        }}
      >
        button
      </button>
    </>
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
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should have a greeting as the title', () => {
    const { getByText } = render(<App />);
    expect(getByText(/Welcome presenter-practice/gi)).toBeTruthy();
  });
}
