import Scrapper from "./scrapper";

const main = async () => {
  let scrapper = Scrapper.getInstance();

  await scrapper.getResults();
};

main();
