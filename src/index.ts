import express from "express";
import { mountRoutes } from "./router";
import Results from "./scrap/results";
// import db from "./db"

const app = express();
const port = 3000;

mountRoutes(app);

app.listen(port, () => {
  console.log("listening on port " + port);
});

const main = async () => {
  await Promise.all([
    new Promise(async (resolve, reject) => {
      await new Results().getResults();
      resolve(null);
    }),
  ]);
};

// main();
