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
  raceCompare,
  convertRoundToUsefulString,
  getQualifyingPositions,
} from '@shorttrack-app/gcpv-db';

const syncLocation = process.env.PAT_FILE || '/media/meet.pat';
const COMPETITION_ID = process.env.COMPETITION_ID || 3;
const mdb = new MDBReader(readFileSync(syncLocation));
const competition_no = getCompetitionId(mdb);

const watcher = watch(syncLocation, { delay: 5000 });
watcher.on('change', function (evt, name) {
  // on update
  updateCompetitors();
  updateRaces();
  updateProgramItems();
});

updateCompetitors();
updateRaces();
updateProgramItems();

function updateProgramItems() {
  // get list of program items from mdb
  const programs = getPrograms(mdb, competition_no);
  const races = getRaces(mdb, competition_no);
  // since programs represent the entire distance, we need to work back from the races,
  // and group them by sequence, label them with the required info
  // to get the 'heat' value, we use the qual_or_fin field, which is a string with the possible values:
  // 'Qual' - Qualification
  // 'Fin' - Final
  // 'Demi' - Semi-final

  const racesBySequence = races.reduce((result, race) => {
    const { sequence, programItemId, id, round } = race;
    const existingEntry = result.find(
      (entry) =>
        entry.sequence === sequence
    );

    if (existingEntry) {
      existingEntry.race_ids.push(id as number);
    } else {
      const program = programs.find((program) => program.id === programItemId);

      result.push({
        competition_id: COMPETITION_ID as number,
        name: `${program.group} ${
          program.distance
        } ${convertRoundToUsefulString(round)}` as string,
        sequence: sequence as number,
        qualifying_positions: getQualifyingPositions(
          mdb,
          sequence,
          round,
          programItemId,
          competition_no
        ) as string,
        race_ids: [id] as number[],
      });
    }
    // console.log('result', result);

    return result;
  }, []);

  // map the information to:
  // {
  //   competition_id: COMPETITION_ID,
  //   name: "Women's 500m heats"
  //   race_ids: [1, 2, 3]
  //   pat_id: 1
  // }

  // get current program items from supabase
  // compare and make update, insert, and delete lists
  supabase
    .from('program_items')
    .select('*')
    .match({ competition_id: COMPETITION_ID })
    .then(async (res) => {
      const { data: supabaseProgramItems } = res;
      const { insert, update } = racesBySequence.reduce(
        (acc, programItem) => {
          const supabaseProgramItem = supabaseProgramItems.find(
            (c) => c.sequence === programItem.sequence
          );
          if (supabaseProgramItem) {
            // update
            acc.update.push({
              ...programItem,
              id: supabaseProgramItem.id,
            });
          } else {
            // insert
            acc.insert.push(programItem);
          }
          return acc;
        },
        { insert: [], update: [] }
      );

      console.log('count', update.length, insert.length);

      const deleteList = supabaseProgramItems.filter(
        (supabaseProgramItem) =>
          (!racesBySequence.find(
            (c) => c.sequence === supabaseProgramItem.sequence
          ) && supabaseProgramItem.sequence !== null)
      );

      // delete
      await Promise.all(
        deleteList.map((programItem) =>
          supabase.from('program_items').delete().eq('id', programItem.id)
        )
      ).catch((err) => console.log(err));

      // update
      await Promise.all(
        update.map((programItem) =>
          supabase
            .from('program_items')
            .update(programItem)
            .eq('id', programItem.id)
        )
      ).catch((err) => console.log(err));

      // insert
      await Promise.all(
        insert.map(async (programItem) =>{
            const { data, error } = await supabase.from('program_items').insert(programItem);
            if (error) {
              console.log(error);
            }
        })
      ).catch((err) => console.log(err));
    });
}

function updateRaces() {
  // get list of races from mdb
  const races = getRaces(mdb, competition_no);
  const programs = getPrograms(mdb, competition_no);
  const lanes = getLanes(mdb, competition_no);
  // map the information to:
  // {
  //   competition_id: COMPETITION_ID,
  //   name: "10a"
  //   distance: 1000,
  //   track: 111,
  //   program_name: "1000m ladies",
  //   lanes: [],
  //   pat_id: 1
  // }
  const mappedRaces = races.map((race) => {
    const program = programs.find((c) => c.id === race.programItemId);
    const lanesForRace = lanes.filter((l) => l.raceId === race.id);
    return {
      competition: COMPETITION_ID as number,
      name: race.name as string,
      distance: race.distance as number,
      track: race.track as number,
      program_name: `${program.group} ${program.distance}`,
      lanes: lanesForRace,
      pat_id: race.id as number,
    };
  });

  // get current races from supabase
  // compare and make update, insert, and delete lists
  supabase
    .from('races')
    .select('*')
    .match({ competition: COMPETITION_ID })
    .then(async (res) => {
      const { data: supabaseCompetitors, error: competitorsError } =
        await supabase
          .from('competitors')
          .select('*')
          .match({ competition_id: COMPETITION_ID });
      if (competitorsError) {
        console.error(competitorsError);
      }

      const supabaseRacePatIds = res.data.map((r) => r.pat_id);
      const racesToDelete = res.data.filter(
        (r) => !mappedRaces.find((mr) => mr.pat_id === r.pat_id)
      );
      const racesToInsert = mappedRaces
        .filter((mr) => !supabaseRacePatIds.includes(mr.pat_id))
        .sort(raceCompare);
      const racesToUpdate = mappedRaces.filter((mr) =>
        supabaseRacePatIds.includes(mr.pat_id)
      );

      racesToInsert.forEach(async (race) => {
        const { lanes, ...raceObj } = race;
        const { data, error } = await supabase
          .from('races')
          .insert(raceObj)
          .select();
        if (data) {
          const lanesToInsert = lanes.map((lane) => {
            console.log('lane: ', lane.skaterUpid);
            return {
              raceId: data[0].id,
              id: lane.startPosition,
              competitorId: supabaseCompetitors.find(
                (c) => c.universal_competitor_id === lane.skaterUpid
              )?.id,
            };
          });
          const { data: data2, error: error2 } = await supabase
            .from('lanes')
            .upsert(lanesToInsert, { onConflict: 'id, raceId' });
          if (error2) {
            console.error(error2);
          }
        }
        if (error) {
          console.error(error);
        }
      });

      racesToUpdate.forEach(async (race) => {
        const { lanes, ...raceObj } = race;
        const { data, error } = await supabase
          .from('races')
          .update(raceObj)
          .match({
            competition: race.competition,
            name: race.name,
          })
          .select();
        if (data) {
          const lanesToInsert = lanes.map((lane) => {
            return {
              raceId: data[0].id,
              id: lane.startPosition,
              competitorId: supabaseCompetitors.find(
                (c) => c.universal_competitor_id === lane.skaterUpid
              )?.id,
            };
          });
          supabase
            .from('lanes')
            .upsert(lanesToInsert, { onConflict: 'id, raceId' });
        }
        if (error) {
          console.error(error);
        }
      });

      racesToDelete.forEach(async (race) => {
        const { data: data1, error } = await supabase
          .from('races')
          .delete()
          .match({
            competition: race.competition,
            name: race.name,
          });
        if (error) {
          console.error(error);
        }
      });
    });
}

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
