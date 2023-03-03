import MDBReader from 'mdb-reader/lib/types/MDBReader';
import { getCompetitors, getCompetitorsInCompetition } from './competitors';

export const getDistances = (mdb: MDBReader) => {
  return mdb
    .getTable('TDistances_Standards')
    .getData({ columns: ['NoDistance', 'Distance', 'LongueurEpreuve'] })
    .map((row) => {
      const track = (row.Distance as string).includes('(111)') ? 111 : 100;
      return {
        id: row.NoDistance,
        name: row.Distance,
        length: row.LongueurEpreuve,
        track: track,
      };
    });
};

// Gives an array of programitems, which have raceId's in an array
export const getPrograms = (mdb: MDBReader, competitionId) => {
  const distances = getDistances(mdb);
  return mdb
    .getTable('TProg_Courses')
    .getData({
      columns: [
        'CleDistancesCompe',
        'NoCompetition',
        'NoDistance',
        'Distance',
        'NoVague',
        'Groupe',
        'OrdreSequence',
      ],
    })
    .filter((row) => row.NoCompetition === competitionId)
    .map((row) => {
      const distance = distances.find(
        (distance) => distance.id === row.NoDistance
      );
      return {
        id: row.CleDistancesCompe,
        competitionId: row.NoCompetition,
        distanceId: row.NoDistance,
        distance: row.Distance,
        group: row.Groupe,
        length: distance.length,
        track: distance.track,
      };
    });
};

// Get all races for a competition
export const getRaces = (mdb: MDBReader, competitionId: number) => {
  const programItems = getPrograms(mdb, competitionId);
  const races = mdb.getTable('TVagues').getData({
    columns: ['CleTVagues', 'NoVague', 'CleDistancesCompe', 'Qual_ou_Fin', 'Seq'],
  });
  return races.map((race) => {
    const programItem = programItems.find(
      (item) => item.id === race.CleDistancesCompe
    );
    return {
      id: race.CleTVagues as number,
      name: race.NoVague as string,
      distance: programItem.length as number,
      track: programItem.track as number,
      programItemId: programItem.id as number,
      sequence: race.Seq as number,
      round: race['Qual_ou_Fin'] as string,
    };
  });
};

export const getLanes = (mdb: MDBReader, competitionId: number) => {
  const races = getRaces(mdb, competitionId);
  const competitors = getCompetitorsInCompetition(mdb, competitionId);
  return mdb
    .getTable('TPatVagues')
    .getData({
      columns: [
        'CleTVagues', // race id ref
        'NoPatCompe', // skaterincompetition id ref
        'Temps', // time
        'Rang', // finish position
        'NoCasque', // start position
        'CleTPatVagues', // unique id
      ],
    })
    .filter((lane) => races.find((race) => lane.CleTVagues === race.id))
    .map((lane) => {
      const competitor = competitors.find((c) => c.id === lane.NoPatCompe)
      return {
        id: lane.CleTPatVagues as number,
        raceId: lane.CleTVagues as number,
        skaterInCompetitionId: lane.NoPatCompe as number,
        skaterUpid: competitor.competitorId as string,
        time: lane.Temps as string,
        position: lane.Rang as number,
        startPosition: lane.NoCasque as number,
      };
    });
};

export const getQualifyingPositions = (mdb: MDBReader, sequence: number, round: string, programId, competitionId: number) => {
  // get programs
  const programs = mdb.getTable('TProg_Courses').getData({
    columns: ['NoCompetition', 'CleDistancesCompe', 'CritVagueAQuart'],
  }).filter((row) => row.NoCompetition === competitionId);

  // if the round is a final, return empty
  if (round === 'Fin') {
    return "";
  }

  // if the round is a qualification, look up the value in the program
  const program = programs.find((p) => p.CleDistancesCompe === programId);
  if (round === 'Qual') {
    return program[`CritVagueAQuart`];
  }

  // if round is a semi-final, look up the value in the program
  if (round === 'Demi') {
    return `${program['CritVagueA']} & ${program['CritVagueABloc2TousDemi']}`;
  }

}


// // Extract possible results from the lane objects
// const resultsInCompetition = lanesInCompetition.map(
//   ({ NoPatCompe, Temps, Rang, CleTPatVagues }) => {
//     return {
//       type: 'official',
//       NoPatCompe,
//       Temps,
//       Rang,
//       CleTPatVagues
//     }
//   }
// )
