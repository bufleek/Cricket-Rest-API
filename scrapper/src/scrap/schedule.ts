import { ElementHandle } from "puppeteer";
import { insertSeries } from "../api";
import Scrapper from "../scrapper";
import { stripMatchInfo } from "./utils/fixture";

// const insert = (data: any) => {
//   fs.writeFileSync("./data/scheduled.json", JSON.stringify(data));
// };

export default class Schedule {
  private scrapper = Scrapper.getInstance();

  private async getFixtures(seriesEl: ElementHandle<Element>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const fixturesEls = await seriesEl.$$(".schedule-box");
      let fixtures = [];

      for (let f = 0; f < fixturesEls.length; f++) {
        const fixtureEl = fixturesEls[f];

        let scheduleName = await fixtureEl.$eval(".schedule-name", (node) => {
          let tc = node && node.textContent;
          return tc && tc.split(",");
        });

        let team_names = scheduleName ? scheduleName[0].split("vs") : null;
        let subtitle = scheduleName ? scheduleName[1].trim() : null;

        let scheduleInfo = await fixtureEl.$eval(
          ".schedule-info",
          (node) => node.textContent
        );

        let info = stripMatchInfo(scheduleInfo || "");

        let flags = await fixtureEl.$$eval(
          ".schedule-box-right .flag_icon div img",
          (nodes) => nodes.map((node) => node.getAttribute("src"))
        );

        fixtures.push({
          status: "SCHEDULED",
          teams:
            team_names &&
            team_names.map((name, index) => ({
              name: name.trim(),
              logo_url: flags[index + 1],
            })),
          subtitle,
          ...info,
        });
      }
      resolve(fixtures);
    });
  }

  public async getSchedule() {
    let run = async () => {
      await this.scrapper.initializeScrapper();
      let page = await Scrapper.browser.newPage();
      try {
        await page.setViewport({ width: 1200, height: 600 });
        await page.goto(
          "https://www.news18.com/cricketnext/cricket-schedule/",
          { waitUntil: "networkidle0", timeout: 90000 }
        );
        // console.log("schedule loaded");
        await page.waitForSelector("ul.schedule_tab");
        await page.click("ul.schedule_tab a:nth-child(1)");
        await page.waitForSelector(".schedule-row");
        const seriesEls = await page.$$(".schedule-row");
        let series = [];

        for (let s = 0; s < seriesEls.length; s++) {
          const seriesEl = seriesEls[s];
          let title = await seriesEl.$eval(
            ".schedule-date",
            (node) => node.textContent
          );
          title = title && title.trim();
          const fixtures = await this.getFixtures(seriesEl);
          series.push({
            title,
            fixtures,
          });
        }
        // insert(series);
        console.log("inserting schedule");
        await insertSeries(series);
        console.log("inserted");
        await page.close();
      } catch (error) {
        // console.error(error);
        await page.close();
        await run();
      }
    };
    await run();
  }
}
