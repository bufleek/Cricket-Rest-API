import fs from "fs";
import { insertSeries } from "./../api";

let data = fs.readFileSync("./data/results.json", "utf-8");
insertSeries(data).then(() => {
  data = fs.readFileSync("./data/scheduled.json", "utf-8");
  insertSeries(data);
});
