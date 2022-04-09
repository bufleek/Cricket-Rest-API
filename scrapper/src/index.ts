import bodyParser from "body-parser";
import express from "express";
import Scrapper from "./scrapper";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000;

const main = async () => {
  const scrapper = Scrapper.getInstance();
  scrapper.initializeScrapper();
  // // const scheduled = new Scheduled();
  // scheduled.getSchedule();
};

main().finally(() => {
  app.listen(port, () => {
    console.log("listening on port " + port);
  });
});
