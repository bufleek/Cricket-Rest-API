import puppeteer, { Browser, Page } from "puppeteer";
import { getFixtures } from "./api";
import Live from "./scrap/live";

export default class Scrapper {
  private static instance: Scrapper;
  public static browser: Browser;

  private constructor() {}

  public static getInstance(): Scrapper {
    if (Scrapper.instance == null) {
      Scrapper.instance = new Scrapper();
    }

    return Scrapper.instance;
  }

  public async initializeScrapper() {
    if (Scrapper.browser == null) {
      Scrapper.browser = await puppeteer.launch({ headless: true });

      new Promise(async (resolve, reject) => {
        let live = new Live();
        let liveFixtures: any[] = [];
        let pages: (Page | null)[] = [];

        const run = async () => {
          let page = await Scrapper.browser.newPage();
          try {
            await page.setViewport({ width: 1200, height: 600 });
            await page.goto(
              "https://www.news18.com/cricketnext/cricket-live-scorecard/",
              {
                waitUntil: "networkidle2",
                timeout: 60000,
              }
            );
            let series = await live.getLiveFixtures(page);
            let rawLiveFixtures: any[] = [];
            series.forEach((srs) => {
              srs.fixtures.forEach((fxtr: any) => {
                rawLiveFixtures.push(fxtr);
              });
            });

            if (
              liveFixtures === undefined ||
              liveFixtures === null ||
              liveFixtures.length === 0 ||
              liveFixtures.length != rawLiveFixtures.length
            ) {
              liveFixtures = await getFixtures(series)
                .then((data) => data)
                .catch(({ response }) => {
                  console.log("error ", response.data);
                });
              await Promise.all(
                pages.map(
                  (it) =>
                    new Promise(async (resolve, _) => {
                      await it?.close();
                    })
                )
              );

              for (let f = 0; f < rawLiveFixtures.length; f++) {
                let rawFixture = rawLiveFixtures[f];
                let fixturePage =
                  rawFixture.team_a.full_score != "" &&
                  rawFixture.team_b.full_score != ""
                    ? await Scrapper.browser.newPage()
                    : null;
                pages.push(fixturePage);
              }
            }

            await Promise.all(
              pages.map(
                (fixturePage, index) =>
                  new Promise(async (resolve, _) => {
                    if (fixturePage === null) {
                      resolve(null);
                      return;
                    }
                    let fixture = liveFixtures[index];
                    fixture.commentary_url =
                      rawLiveFixtures[index].commentary_url;
                    await fixturePage.setViewport({ width: 1200, height: 600 });

                    await live.getLiveScorecard(
                      fixturePage,
                      liveFixtures[index]
                    );
                    resolve(null);
                  })
              )
            );

            await page.close();
            console.log("complete loop");
            await run();
          } catch (error) {
            console.log(error);
            await page.close();
            await run();
          }
        };

        await run();
        console.log("loop complete");
      });
    }
  }
}
