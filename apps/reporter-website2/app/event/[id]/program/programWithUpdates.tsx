'use client';

import { supabase } from '../../../../utils/supabase';
import { useEffect, useState } from 'react';
import { CheckCircleIcon, ChevronRightIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

function ProgramWithUpdates({ serverProgram, competitionId }) {
  const [program, setProgram] = useState(serverProgram);
  useEffect(() => {
    const sub = supabase
      .channel('ProgramUpdates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'program_items',
          filter: `competition_id=eq.${competitionId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProgram([...program, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setProgram(
              program.map((item) =>
                item.id === payload.new.id ? payload.new : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setProgram(program.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [competitionId]);

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {program.map((item : {
    competition_id: number;
    created_at: string;
    id: number;
    name: string;
    qualifying_positions: string;
    race_ids: number[];
    sequence: number;
    time_start_expected: string;
    updated_at: string;
}) => (
          <li key={item.id} className="px-2 py-2 sm:px-6">
            <Link href={`/event/${competitionId}/program/${item.sequence}`} className="group block">
              <div className="flex items-center py-3 px-3 sm:py-3 sm:px-0">
                {item.name} , {item.race_ids.length > 1 ? (`${item.race_ids.length} races`): (`1 race`)}, {item.time_start_expected}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProgramWithUpdates;
