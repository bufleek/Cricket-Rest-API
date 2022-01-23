import puppeteer, { Browser } from "puppeteer";

export default class Scrapper {
  private static instance: Scrapper;
  private static browser: Browser;

  private constructor() {}

  public static getInstance(): Scrapper {
    if (Scrapper.instance == null) {
      Scrapper.instance = new Scrapper();
    }

    return Scrapper.instance;
  }

  private async initializeScrapper() {
    if (Scrapper.browser == null) {
      Scrapper.browser = await puppeteer.launch({ headless: false });
    }
  }

  public async getResults() {
    await this.initializeScrapper();
    let page = await Scrapper.browser.newPage();
    let navigate = async () => {
      try {
        await page.goto("https://www.news18.com/cricketnext/results");
        await page.waitForSelector(".schedule-row");
      } catch (error) {
        await navigate();
      }
    };
    await navigate();
    let allSchedules = await page.$$(".schedule-row");
    let series = [];
    for (let i = 0; i < allSchedules.length; i++) {
      let schedule = allSchedules[i];
      let fixtures = [];
      let fixtures_els = await schedule.$$(".series_result");
      for (let j = 0; j < fixtures_els.length; j++) {
        let fixture_el = fixtures_els[j];
        let info = await fixture_el.$eval(
          ".schedule-info",
          (node) => node.textContent
        );
        let date = info?.split(".", 1)[0];
        let teams = [];
        let teams_els = await fixture_el.$$(".result_flag_row");
        for (let k = 0; k < teams_els.length; k++) {
          let team_el = teams_els[k];
          let overs = await team_el.$eval(
            ".series_run sub",
            (node) => node.textContent
          );
          let score = await team_el.$eval(
            ".series_run",
            (node) => node.textContent
          );
          let team = {
            name: await team_el.$eval(
              ".series_name",
              (node) => node.textContent
            ),
            image_url: await team_el.$eval(".flag_icons_result img", (node) =>
              node.getAttribute("src")
            ),
            score: score?.replace("" + overs, ""),
            overs: overs?.replace("(", "").replace(" OVR)", "").trim(),
          };
          teams.push(team);
        }
        fixtures.push({
          status: "Concluded",
          status_note: await fixture_el.$eval(
            ".run_info",
            (node) => node.textContent
          ),
          date: date?.trim(),
          venue: info?.replace(date + ". ", "") || null,
          teams,
        });
      }
      series.push({
        title: await schedule.$eval(
          ".schedule-date",
          (node) => node.textContent
        ),
        fixtures,
      });
    }
    console.log(series);
  }
}
