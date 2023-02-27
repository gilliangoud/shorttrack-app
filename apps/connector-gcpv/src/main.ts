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

updateCompetitors();

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
    }});

    // upsert competitors in supabase by universal_competitor_id and competition_id without using onConflict
    mappedCompetitors.forEach(async (competitor) => {
      const { data, error } = await supabase
        .from('competitors')
        .upsert(competitor)
        .match({ universal_competitor_id: competitor.universal_competitor_id, competition_id: competitor.competition_id });
      if (error) {
        console.error(error);
      }
    });

}
