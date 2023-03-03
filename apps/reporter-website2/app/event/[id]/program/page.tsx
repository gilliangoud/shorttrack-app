import { supabase } from '../../../../utils/supabase';
import { notFound } from 'next/navigation';
import ProgramWithUpdates from './programWithUpdates';
import { CalendarIcon, MapPinIcon, UsersIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export const revalidate = 30;

async function page({ params: { id } }: { params: { id: string } }) {
  const { data: competition } = await supabase
    .from('competitions')
    .select()
    .match({ id })
    .single();
  const { data: programItems } = await supabase
    .from('program_items')
    .select()
    .match({ competition_id: id })
    .order('sequence', { ascending: true });
  const programItemsByDate = programItems.reduce((acc, item) => {
    const date =
      item.time_start_expected != null
        ? dateRangeText([new Date(item.time_start_expected)])
        : 'No date';
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  if (!competition) {
    notFound();
  }

  return (
    <>
      <div className="flex lg:items-center lg:justify-between bg-white mb-4 rounded-md">
        <div className="flex-wrap flex  items-center justify-center align-middle">
          <Image
            className='self-center justify-center items-center align-middle'
            src={competition.splash_image}
            alt={competition.name}
            width={70}
            height={150}
          />
        </div>
        <div className="min-w-0 flex-1 px-2 p-3">
          <nav className="flex" aria-label="Breadcrumb">
            <ol role="list" className="flex items-center space-x-4">
              <li>
                <div className="flex">
                  <Link
                    href="#"
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Home
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
                    {competition.name}
                  </a>
                </div>
              </li>
            </ol>
          </nav>
          <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {competition.name}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <MapPinIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {competition.location}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <UsersIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {competition.hosts?.map((host) => host).join(', ')}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <CalendarIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {dateRangeText(competition.dates?.map((date) => new Date(date)))}
            </div>
          </div>
        </div>
      </div>
      <ProgramWithUpdates serverProgram={programItems} competitionId={id} />
    </>
  );
}

function dateRangeText(dates: Date[]): string {
  if (!Array.isArray(dates) || dates.length === 0) {
    return 'Invalid input';
  }

  if (dates.length === 1) {
    const date = dates[0];
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${day} ${month}`;
  }

  dates = dates.sort((a, b) => a.getTime() - b.getTime());
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  const startMonth = startDate.toLocaleString('default', { month: 'short' });
  const endMonth = endDate.toLocaleString('default', { month: 'short' });
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();

  if (startMonth === endMonth) {
    return `${startDay}-${endDay} ${startMonth}`;
  } else {
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  }
}

export default page;
