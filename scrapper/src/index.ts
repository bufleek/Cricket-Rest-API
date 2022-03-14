import bodyParser from "body-parser";
import express from "express";
import Results from "./scrap/results";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000;

const main = async () => {
  const results = new Results();
  results.getResults();
};

main().finally(() => {
  app.listen(port, () => {
    console.log("listening on port " + port);
  });
});
