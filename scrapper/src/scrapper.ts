import puppeteer, { Browser, Page } from "puppeteer";
import { getFixtures, getLiveFixtures } from "./api";
import Live from "./scrap/live";
import Results from "./scrap/results";
import Schedule from "./scrap/schedule";

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
      Scrapper.browser = await puppeteer.launch({ headless: false });

      new Promise(async (resolve, reject) => {
        let live = new Live();
        let liveFixtures: any[] = [];
        let pages: (Page | null)[] = [];

        const initializeDb = async () => {
          try {
            let initialScheduledFixtures = await getFixtures("scheduled");
            if (initialScheduledFixtures.count === 0) {
              await new Schedule().getSchedule();
              await new Results().getResults();
            }
            let initialCompletedFixtures = await getFixtures("concluded");
            if (initialCompletedFixtures.count === 0) {
              await new Results().getResults();
            }
          } catch (_) {
            await initializeDb();
          }
        };
        await initializeDb();
        const run = async () => {
          let page = await Scrapper.browser.newPage();
          try {
            await page.setViewport({ width: 1200, height: 600 });
            await page.goto(
              "https://www.news18.com/cricketnext/cricket-live-scorecard/",
              {
                waitUntil: "networkidle0",
                timeout: 90000,
              }
            );
            let series: any[] = [];
            await live
              .getLiveFixtures(page)
              .then((s) => {
                series = s;
              })
              .catch((_) => {
                throw new Error("");
              });

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
              liveFixtures = await getLiveFixtures(series)
                .then((data) => data)
                .catch(({ response }) => {
                  // console.log("error ", response.data);
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
            // console.log("complete loop");
            await run();
          } catch (error) {
            // console.log(error);
            await page.close();
            await run();
          }
        };

        await run();
        await this.initializeScrapper();
      });
    }
  }
}
