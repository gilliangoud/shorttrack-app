import { readFileSync, appendFileSync, unlinkSync } from 'fs';
import MDBReader from 'mdb-reader';
import watch from 'node-watch';

import {
  getCompetitionId,
  getCompetitors,
  getCompetitorsInCompetition,
  getRaces,
  getPrograms,
  getLanes,
  letterToNumber,
  raceCompare,
} from '@shorttrack-app/gcpv-db';

const syncLocation = process.env.PAT_FILE || '/media/meet.pat';
const eventFile = process.env.EVT_FILE || '/media/LYNX.EVT';
const mdb = new MDBReader(readFileSync(syncLocation));
const competition_no = getCompetitionId(mdb);

watch(syncLocation, { delay: 5000 }, function (evt, name) {
  if (evt == 'update') {
    // delete file if it exists
    try {
      unlinkSync(eventFile);
    } catch (error) {
      console.log('Event File does not exist yet');
    }

    // get races
    const races = getRaces(mdb, competition_no).sort((a, b) =>
      raceCompare(a, b)
    );
    const programs = getPrograms(mdb, competition_no);
    const lanes = getLanes(mdb, competition_no);
    const competitorsInComp = getCompetitorsInCompetition(mdb, competition_no);
    const competitors = getCompetitors(mdb);
    races.forEach((race) => {
      // for every race print one line with the race info
      const event = race.name.toString().replace(/[a-z]/gi, '');
      const heat = letterToNumber(
        race.name
          .toString()
          .match(/[a-zA-Z]/g)
          .join('')
      );
      const programItem = programs.find((c) => c.id === race.programItemId);

      appendFileSync(
        eventFile,
        `${event},${event},${heat},${race.name} ${programItem.group} ${programItem.length}m ${programItem.track}m\n`
      );

      // for every lane in the race print one line with the lane info
      lanes
        .filter((c) => c.raceId === race.id)
        .sort((a, b) => a.startPosition - b.startPosition)
        .forEach((lane) => {
          const competitor = competitorsInComp.filter(
            (c) => c.id === lane.skaterInCompetitionId
          )[0];
          const competitorInfo = competitors.filter(
            (c) => c.id === competitor.competitorId
          )[0];
          appendFileSync(
            eventFile,
            `,${competitor.helmetId},${lane.startPosition},${competitorInfo.lastName},${competitorInfo.firstName},${competitor.affiliation},,${competitorInfo.id}\n`
          );
        });
    });
  }

  if (evt == 'remove') {
    // on delete
  }
});
