import MDBReader from 'mdb-reader/lib/types/MDBReader';

export const getCompetitors = (mdb: MDBReader) => {
  return mdb
    .getTable('TPatineurs')
    .getData({
      columns: [
        'NoPatineur',
        'Prenom',
        'Nom',
        'Date de naissance',
        'Sexe',
        'Division',
        'NoCategorie',
        'NoClub',
        'CodePat',
      ],
    })
    .map((competitor) => {
      return {
        id: competitor.CodePat,
        NoPatineur: competitor.NoPatineur,
        firstName: competitor.Prenom,
        lastName: competitor.Nom,
        birthDate: competitor['Date de naissance'],
        sex: competitor.Sexe,
        division: competitor.Division,
        categoryId: competitor.NoCategorie,
        clubId: competitor.NoClub,
      };
    });
};

export const getCompetitorsInCompetition = (
  mdb: MDBReader,
  competitionId: number
) => {
  const competitors = getCompetitors(mdb);
  const clubs = getClubs(mdb);
  return mdb
    .getTable('TPatineur_compe')
    .getData({
      columns: [
        'NoPatCompe',
        'NoCompetition',
        'NoPatineur',
        'NoCategorie',
        'NoClub',
        'Rang',
        'Retirer',
        'Groupe',
        'NoCasque',
      ],
    })
    .filter((competitor) => competitor.NoCompetition === competitionId)
    .map((competitor) => {
      return {
        id: competitor.NoPatCompe,
        competitorId: competitors.find((c) => c.NoPatineur === competitor.NoPatineur).id,
        clubId: competitor.NoClub,
        affiliation: clubs.find((c) => c.id === competitor.NoClub).abbreviation,
        rank: competitor.Rang,
        removed: competitor.Retirer,
        group: competitor.Groupe,
        helmetId: competitor.NoCasque,
      };
    });
};

export const getCompetitorGroups = (mdb: MDBReader, competitionId: number) => {
  return mdb
    .getTable('TGroupes_Compe')
    .getData()
    .filter((group) => group.NoCompetition === competitionId)
    .map((group) => {
      return {
        id: group.IDGroupesCompe,
        name: group.Groupe,
      };
    });
};

export const getClubs = (mdb: MDBReader) => {
  return mdb
    .getTable('TClubs')
    .getData()
    .map((club) => {
      return {
        id: club.NoClub,
        name: club['Nom du Club'],
        description: club.Commentaire,
        region: club.NoRegion,
        abbreviation: club.Abreviation || club['Nom du Club'],
      };
    });
};

// regions represent provinces in Canada
export const getRegions = (mdb: MDBReader) => {
  return mdb
    .getTable('TRegions')
    .getData()
    .map((region) => {
      return {
        id: region.NoRegion,
        name: region.Region,
      };
    });
}
