import { supabase } from '../../../../utils/supabase';
import { notFound } from 'next/navigation';

export const revalidate = 30;

async function Competitors({ params: { id } }: { params: { id: string } }) {
  const { data: competition } = await supabase
    .from('competitions')
    .select()
    .match({ id })
    .single();
  const { data: competitors } = await supabase
    .from('competitors')
    .select()
    .match({ competition_id: id });
  const competitorsByGroup = competitors.reduce((acc, competitor) => {
    if (competitor.group_name === null) {
      return acc;
    }
    if (!acc[competitor.group_name]) {
      acc[competitor.group_name] = [];
    }
    acc[competitor.group_name].push(competitor);
    return acc;
  }, {});

  if (!competition) {
    notFound();
  }

  return (
    <div className="w-screen-xl flex flex-wrap flex-grow justify-evenly">
        {/* <pre>{JSON.stringify(competitors, null, 2)}</pre> */}
        {Object.keys(competitorsByGroup).map((groupName) => (
          <div key={groupName} className="min-w-0 w-96 mb-4 overflow-hidden sm:rounded-b-lg">
            <div
              className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6 sm:rounded-t-lg shadow"
            >
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                {groupName}
              </h3>
            </div>
            <div className="h-full bg-white px-4 py-5 sm:px-6">
              <ul>
                {competitorsByGroup[groupName].map(
                  (competitor: {
                    affiliation: string;
                    category_name: string;
                    club_name: string;
                    competition_id: number;
                    created_at: string;
                    first_name: string;
                    group_name: string;
                    helmet_id: number;
                    id: number;
                    last_name: string;
                    scratched: boolean;
                    universal_competitor_id: string;
                    updated_at: string;
                  }) => (
                    <li key={competitor.id} className={competitor.scratched ? 'line-through' : ''}>
                      {competitor.helmet_id}: {competitor.first_name}{' '}
                      {competitor.last_name}, {competitor.club_name} -{' '}
                      {competitor.affiliation},{' '}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        ))}
    </div>
  );
}

export default Competitors;
