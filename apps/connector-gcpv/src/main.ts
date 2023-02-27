import { readFileSync, appendFileSync, unlinkSync } from 'fs';
import MDBReader from 'mdb-reader';
import watch from 'node-watch';

import { createClient } from '@supabase/supabase-js';
import { Database } from '@shorttrack-app/st-app-db';
const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

import {
  getCompetitionId,
  getCompetitors,
  getCompetitorsInCompetition,
  getRaces,
  getPrograms,
  getLanes,
} from '@shorttrack-app/gcpv-db';

const syncLocation = process.env.PAT_FILE || '/media/meet.pat';
const COMPETITION_ID = process.env.COMPETITION_ID || 3;
const mdb = new MDBReader(readFileSync(syncLocation));
const competition_no = getCompetitionId(mdb);

watch(syncLocation, { delay: 5000 }, function (evt, name) {
  if (evt == 'update') {
    // on update
    updateCompetitors();
  }

  if (evt == 'remove') {
    // on delete
  }
});

function updateCompetitors() {
  const competitors = getCompetitors(mdb);
  const competitorsInCompetition = getCompetitorsInCompetition(
    mdb,
    competition_no
  );

  const mappedCompetitors = competitors.map((competitor) => {
    const competitorInCompetition = competitorsInCompetition.find(
      (c) => c.competitorId === competitor.id
    );
    return {
      universal_competitor_id: competitor.id as string,
      last_name: competitor.lastName as string,
      first_name: competitor.firstName as string,
      competition_id: COMPETITION_ID as number,
      group_name: competitorInCompetition?.group as string,
      helmet_id: competitorInCompetition?.helmetId as number,
      scratched: competitorInCompetition?.removed as boolean,
      club_name: competitorInCompetition?.club_name as string,
      category_name: competitor.categoryId as string,
      affiliation: competitorInCompetition?.affiliation as string,
    };
  });

  // create list of competitors that arents in supabase and a list of competitors that are in supabase
  supabase
    .from('competitors')
    .select('*')
    .match({ competition_id: COMPETITION_ID })
    .then((res) => {
      const supabaseCompetitorIds = res.data.map(
        (c) => c.universal_competitor_id
      );
      const competitorsToUpdate = mappedCompetitors.filter((c) =>
        supabaseCompetitorIds.includes(c.universal_competitor_id)
      );
      const competitorsToInsert = mappedCompetitors.filter(
        (c) => !supabaseCompetitorIds.includes(c.universal_competitor_id)
      );

      // insert competitors that arent in supabase
      competitorsToInsert.forEach(async (competitor) => {
        const { data, error } = await supabase
          .from('competitors')
          .insert(competitor);
        if (error) {
          console.error(error);
        }
      });

      // update competitors that are in supabase
      competitorsToUpdate.forEach(async (competitor) => {
        const { data, error } = await supabase
          .from('competitors')
          .update(competitor)
          .match({
            universal_competitor_id: competitor.universal_competitor_id,
            competition_id: competitor.competition_id,
          });
        if (error) {
          console.error(error);
        }
      });
    });
}
