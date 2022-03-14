import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-type": "application/json",
  },
});

export default api;

async function insertTeam(team: any): Promise<any> {
  return api
    .post("teams/", { name: "Test Team" })
    .then(({ data }) => data)
    .catch(({ response }) => {
      console.error(response.data);
      return null;
    });
}

async function insertScore(fixture: any, team: any): Promise<any> {
  const scores: string[] = team.score.split("/");
  console.log(scores);
  return api
    .post("scores/", {
      overs: team.overs,
      runs: scores[0],
      balls: scores[1],
      team: team.id,
      fixture: fixture.id,
    })
    .then(({ data }) => data)
    .catch(({ response }) => {
      console.error(response.data);
      return null;
    });
}

async function insertVenue(venue: any): Promise<any> {
  return api
    .post("venues/", { name: venue })
    .then(({ data }) => data)
    .catch(({ response }) => {
      console.error(response.data);
      return null;
    });
}

async function insertFixtures(fixtures: any[], series: any) {
  for (let f = 0; f < fixtures.length; f++) {
    const fixture = fixtures[f];
    const team_a = await insertTeam(fixture.teams[0]);
    const team_b = await insertTeam(fixture.teams[1]);
    const venue = await insertVenue(fixture.venue);

    const insertedFixture = await api
      .post("fixtures/", {
        ...fixture,
        date: new Date(fixture.date),
        team_a: team_a.id,
        team_b: team_b.id,
        venue: venue.id,
        series: series.id,
        status: parseInt(fixture.status),
      })
      .then(({ data }) => data)
      .catch(({ response }) => {
        console.error(response.data);
        return null;
      });

    if (team_a != null) {
      console.log(insertedFixture);
      const team_a_score = await insertScore(insertedFixture, fixture.teams[0]);
      console.log(team_a_score);
    }
    if (team_b != null) {
      const team_b_score = await insertScore(insertedFixture, fixture.teams[1]);
      console.log(team_b_score);
    }

    console.log(insertedFixture);
  }
}

export async function InsertResults(data: any) {
  const rawSeriesData: any[] = JSON.parse(data);

  api.post("series-bulk/", rawSeriesData).catch((a) => {
    console.log(a.response.data);
  });
  // for (let s = 0; s < rawSeriesData.length; s++) {
  //   const rawSeries = rawSeriesData[s];
  //   const series = await api
  //     .post("series/", { title: "Test Series" })
  //     .then(({ data }) => {
  //       return data;
  //     })
  //     .catch(({ response }) => {
  //       console.error(response.data);
  //       return null;
  //     });

  //   series && (await insertFixtures(rawSeries.fixtures, series));
  // }
}
