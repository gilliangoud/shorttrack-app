import { supabase } from '../../../../../utils/supabase';
import { notFound } from 'next/navigation';
import RacesWithUpdates from './racesWithUpdates';
import {
  ArrowUpIcon,
  CalendarIcon,
  ChevronRightIcon,
} from '@heroicons/react/20/solid';
import Link from 'next/link';

export const revalidate = 30;

export async function generateStaticParams({params:{id}}) {
  const { data: items } = await supabase.from('program_items').select('sequence').match({ competition_id: id });
  return items.map((item) => ({
    sequenceId: item.sequence.toString(),
  }));
}

async function page({
  params: { sequenceId, id },
}: {
  params: { sequenceId: string; id: string };
}) {
  const { data: programItem } = await supabase
    .from('program_items')
    .select()
    .match({ sequence: sequenceId, competition_id: id })
    .single();
  const { data: races } = await supabase
    .from('races')
    .select()
    .in('pat_id',
      programItem? programItem.race_ids: [])
    .match({ competition: id })
    .order('pat_id', { ascending: true });
  const { data: lanes } = await supabase
    .from('lanes')
    .select()
    .in(
      'raceId',
      races ? races.map((race) => race.id): []
    );
  const { data: competitors } = await supabase
    .from('competitors')
    .select()
    .in(
      'id',
      lanes ? lanes.map((lane) => lane.competitorId): []
    );

  if (!programItem) {
    notFound();
  }

  return (
    <>
      <div className="lg:flex lg:items-center lg:justify-between p-4 bg-white mb-4 rounded-md">
        <div className="min-w-0 flex-1">
          <nav className="flex" aria-label="Breadcrumb">
            <ol role="list" className="flex items-center space-x-4">
              <li>
                <div className="flex">
                  <Link
                    href={`/event/${programItem.competition_id.toString()}/program`}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Program
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                  <a
                    href="#"
                    className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    {programItem.sequence}
                  </a>
                </div>
              </li>
            </ol>
          </nav>
          <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {programItem.name}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <ArrowUpIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {programItem.qualifying_positions} Qualification
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <CalendarIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {programItem.time_start_expected}
            </div>
          </div>
        </div>
      </div>
      <RacesWithUpdates
        serverRaces={races}
        raceIds={programItem?.race_ids}
        lanes={lanes}
        competitors={competitors}
      />
    </>
  );
}

export default page;
