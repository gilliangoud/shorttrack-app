import { Competitor, Lane, Race } from './app';
import { TimeSince } from './timeSince';

type Props = {
  races: Race[];
  lanes: Lane[];
  competitors: Competitor[];
};

export default function RacesList(props: Props) {
  return (
    <ul className={`divide-y divide-gray-300 h-full`}>
      {props.races.length > 0 ? (
        props.races.map((race) => (
          <li key={race.id} className="">
            <div className="bg-gray-50 px-3 pl-6 py-1 flex justify-between">
              <p className="">
                {race.name} - {race.distance}M({race.track})
              </p>
              <TimeSince
                date={new Date(race.updated_at)}
                text="Last updated:"
                timeStyle="exact"
              />
            </div>
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-1 text-left text-xs font-semibold text-gray-500 sm:pl-6"
                  >
                    Start position
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-1 text-left text-xs font-semibold text-gray-500"
                  >
                    Helmet cover
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-1 text-left text-xs font-semibold text-gray-500"
                  >
                    Competitor
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-1 text-left text-xs font-semibold text-gray-500"
                  >
                    Affiliation
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {props.lanes !== undefined ? (
                  props.lanes
                    .filter((x) => x.raceId === race.id)
                    .map((lane) => (
                      <tr key={lane.id}>
                        <td className="whitespace-nowrap py-2 text-left text-sm font-medium text-gray-800 sm:pl-6">
                          {lane.id}
                        </td>
                        <td className="whitespace-nowrap py-2 px-3 text-left text-sm font-medium text-gray-800">
                          {
                            props.competitors.find(
                              (c) => c.id === lane.competitorId
                            )?.helmet_id
                          }
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-800">
                          {
                            props.competitors.find(
                              (c) => c.id === lane.competitorId
                            )?.first_name
                          }{' '}
                          {
                            props.competitors.find(
                              (c) => c.id === lane.competitorId
                            )?.last_name
                          }
                          {/* Add the competitors name here later with their helmet number */}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-800"></td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td>Loading...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </li>
        ))
      ) : (
        <p className="text-center text-2xl p-6">No races left...</p>
      )}
    </ul>
  );
}
