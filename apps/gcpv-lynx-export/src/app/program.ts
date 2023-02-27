import MDBReader from 'mdb-reader/lib/types/MDBReader';

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
    columns: ['CleTVagues', 'NoVague', 'CleDistancesCompe', 'Qual_ou_Fin'],
  });
  return races.map((race) => {
    const programItem = programItems.find(
      (item) => item.id === race.CleDistancesCompe
    );
    return {
      id: race.CleTVagues,
      name: race.NoVague,
      distance: programItem.length,
      track: programItem.track,
      programItemId: programItem.id as number,
    };
  });
};

export const getLanes = (mdb: MDBReader, competitionId: number) => {
  const races = getRaces(mdb, competitionId);
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
      return {
        id: lane.CleTPatVagues,
        raceId: lane.CleTVagues,
        skaterInCompetitionId: lane.NoPatCompe,
        time: lane.Temps,
        position: lane.Rang,
        startPosition: lane.NoCasque,
      };
    });
};

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
