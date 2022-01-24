import Scrapper from "./scrapper";

const main = async () => {
  let scrapper = Scrapper.getInstance();

  // await scrapper.getResults();
  await scrapper.getScorecard(
    "https://www.news18.com/cricketnext/cricket-live-scorecard/bangladesh-under-19-vs-united-arab-emirates-under-19-live-score-full-bauuau01222022207906.html"
  );
};

main();
