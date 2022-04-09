import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-type": "application/json",
  },
});

export async function insertSeries(data: any) {
  const rawSeriesData: any[] = JSON.parse(data);

  return api.post("series-bulk/", rawSeriesData).catch((a) => {
    console.log(a.response.data);
  });
}

export async function getFixtures(params: any) {
  return api.get("scrapper/get-live/", { data: params });
}

export default api;
