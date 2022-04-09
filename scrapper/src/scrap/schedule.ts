import fs from "fs";
import { ElementHandle } from "puppeteer";
import Scrapper from "../scrapper";
import { stripMatchInfo } from "./utils/fixture";

const insert = (data: any) => {
  fs.writeFileSync("./data/scheduled.json", JSON.stringify(data));
};

export default class Schedule {
  private scrapper = Scrapper.getInstance();

  private async getFixtures(seriesEl: ElementHandle<Element>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const fixturesEls = await seriesEl.$$(".schedule-box");
      let fixtures = [];

      for (let f = 0; f < fixturesEls.length; f++) {
        const fixtureEl = fixturesEls[f];

        let scheduleName = await fixtureEl.$eval(".schedule-name", (node) =>
          node.textContent?.split(",")
        );

        let team_names = scheduleName ? scheduleName[0].split("vs") : null;
        let subtitle = scheduleName ? scheduleName[1].trim() : null;

        let scheduleInfo = await fixtureEl.$eval(
          ".schedule-info",
          (node) => node.textContent
        );

        let info = stripMatchInfo(scheduleInfo || "");

        // let scheduleInfo = await fixtureEl.$eval(".schedule-info", (node) =>
        //   node.textContent?.split("•")
        // );

        // let start_time = scheduleInfo
        //   ? scheduleInfo[2].replace("(IST)", "").trim()
        //   : null;

        // let date = scheduleInfo
        //   ? (() => {
        //       let time_split = start_time?.split(":");
        //       let dateUTC = new Date(scheduleInfo[1]);
        //       dateUTC.setHours(parseInt(time_split ? time_split[0] : ""));
        //       dateUTC.setMinutes(parseInt(time_split ? time_split[1] : ""));
        //       return dateUTC;
        //     })()
        //   : null;
        // let venue = scheduleInfo ? scheduleInfo[3].trim() : null;

        let flags = await fixtureEl.$$eval(
          ".schedule-box-right .flag_icon div img",
          (nodes) => nodes.map((node) => node.getAttribute("src"))
        );

        fixtures.push({
          status: 0,
          teams: team_names?.map((name, index) => ({
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
        await page.goto(
          "https://www.news18.com/cricketnext/cricket-schedule/",
          { waitUntil: "domcontentloaded" }
        );
        await page.click("ul.schedule_tab a:nth-child(1)");
        await page.waitForSelector(".schedule-row");
        const seriesEls = await page.$$(".schedule-row");
        let series = [];

        for (let s = 0; s < seriesEls.length; s++) {
          const seriesEl = seriesEls[s];
          const title = (
            await seriesEl.$eval(".schedule-date", (node) => node.textContent)
          )?.trim();
          const fixtures = await this.getFixtures(seriesEl);
          series.push({
            title,
            fixtures,
          });
        }
        insert(series);
        await page.close();
      } catch (error) {
        console.error(error);
        await page.close();
        await run();
      }
    };
    await run();
  }
}
