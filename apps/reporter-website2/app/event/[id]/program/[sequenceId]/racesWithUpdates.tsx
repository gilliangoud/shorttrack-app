'use client';

import { supabase } from '../../../../../utils/supabase';
import { useEffect, useState } from 'react';

function RacesWithUpdates({ serverRaces, raceIds, lanes, competitors }) {
  const [races, setRace] = useState(serverRaces);
  useEffect(() => {
    const sub = supabase
      .channel('raceUpdates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'races',
          filter: `pat_id=in.${raceIds}`,
        },
        (payload) => {
          console.log('payload', payload);
          // add to array if not already there or update if already there

        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [raceIds]);

  return (
    <ul role="list" className="space-y-3">
      {races.map((race) => (
        <li
          key={race.id}
          className="overflow-hidden bg-white shadow sm:rounded-md"
        >
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  Lane
                </th>
                <th
                  scope="col"
                  className="py-3.5 text-center text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-clip text-sm font-semibold text-gray-900"
                >
                  Competitor
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Time
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Finish position
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {
                lanes
                  .filter((c) => c.raceId === race.id)
                  // sort by finish position then start position
                  .sort(laneSort)
                  .map((lane) => (
                    <tr key={lane.id}>
                      <td className="whitespace-nowrap py-4 text-center text-sm font-medium text-gray-900 sm:pl-6">
                        {lane.id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {
                          competitors.find((c) => c.id === lane.competitorId)
                            ?.helmet_id
                        }
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {
                          competitors.find((c) => c.id === lane.competitorId)
                            ?.first_name
                        }{' '}
                        {
                          competitors.find((c) => c.id === lane.competitorId)
                            ?.last_name
                        }
                        {/* Add the competitors name here later with their helmet number */}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {lane.time}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {lane.finish_position}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </li>
      ))}
    </ul>
  );
}

export default RacesWithUpdates;

const laneSort = (a, b) => {
  // First, compare by finish position
  if (a.finish_position && b.finish_position) {
    return a.finish_position - b.finish_position;
  } else if (a.finish_position) {
    return -1;
  } else if (b.finish_position) {
    return 1;
  }

  // If finish positions are not available, compare by start position
  return a.id - b.id;
};
