import Results from "./scrap/results";
import ScoreCard from "./scrap/scorecard";

const main = async () => {
  await Promise.all([
    new Promise(async (resolve, reject) => {
      await new Results().getResults();
      resolve(null);
    }),
    new Promise(async (resolve, reject) => {
      await new ScoreCard().getScorecard(
        "https://www.news18.com/cricketnext/cricket-live-scorecard/bangladesh-under-19-vs-united-arab-emirates-under-19-live-score-full-bauuau01222022207906.html"
      );
      resolve(null);
    }),
  ]);
};

main();
