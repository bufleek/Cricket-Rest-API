import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-type": "application/json",
  },
});

export async function insertSeries(data: any) {
  const rawSeriesData: any[] = JSON.parse(data);

  return api.post("series-bulk/", rawSeriesData).catch((_) => {});
}

export async function getLiveFixtures(params: any) {
  return api
    .get("scrapper/get-live/", { data: params })
    .then(({ data }) => data)
    .catch((_) => {});
}

export async function updateLive(params: any) {
  return api.post("scrapper/update-live/", { data: params }).catch((_) => {});
}

export async function getFixtures() {
  return api
    .get("fixtures/")
    .then(({ data }) => data)
    .catch((_) => {});
}

export default api;
