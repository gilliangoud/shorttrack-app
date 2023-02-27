import MDBReader from "mdb-reader/lib/types/MDBReader";

export const getCompetitionId = (mdb: MDBReader): number => {
  const competitionTable = mdb.getTable("TCompetition");
  const competition = competitionTable.getData({
    columns: ["NoCompetition", "Lieu", "Date", "NoClub"],
  });
  if (competition.length === 0) {
    throw new Error("No competition found in mdb");
  }
  if (competition.length > 1) {
    throw new Error("Multiple competitions found in mdb");
  }

  return competition[0].NoCompetition as number;
}

export const getCompetition = (mdb: MDBReader, competitionId: number) => {
  const competitionTable = mdb.getTable("TCompetition");
  const competition = competitionTable.getData({
    columns: ["NoCompetition", "Lieu", "Date", "NoClub"],
  }).filter((row) => row.id === competitionId);

  if (competition.length === 0) {
    throw new Error("No competition found in mdb");
  }

  return competition[0];
};
