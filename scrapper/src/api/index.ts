import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-type": "application/json",
  },
});

export async function insertSeries(data: any) {
  return api.post("scrapper/series-bulk/", { data }).catch((_) => {});
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

export async function getFixtures(status: string) {
  return api
    .get(`fixtures/${status}/`)
    .then(({ data }) => data)
    .catch((_) => {});
}

export default api;
