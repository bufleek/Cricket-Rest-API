import Scrapper from "../scrapper";
import Scorecard from "./scorecard";

export default class Results {
  private scrapper = Scrapper.getInstance();

  public async getResults() {
    let run = async () => {
      await this.scrapper.initializeScrapper();
      let page = await Scrapper.browser.newPage();
      try {
        await page.goto("https://www.news18.com/cricketnext/results");
        await page.waitForSelector(".schedule-row");
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
                name: (
                  await team_el.$eval(
                    ".series_name",
                    (node) => node.textContent
                  )
                )?.trim(),
                image_url: (
                  await team_el.$eval(".flag_icons_result img", (node) =>
                    node.getAttribute("src")
                  )
                )?.trim(),
                score: score?.replace("" + overs, "")?.trim(),
                overs: overs?.replace("(", "").replace("OVR)", "").trim(),
              };
              teams.push(team);
            }
            fixtures.push({
              status: "CONCLUDED",
              status_note: (
                await fixture_el.$eval(".run_info", (node) => node.textContent)
              )?.trim(),
              date: date?.trim(),
              venue: (info?.replace(date + ". ", "") || null)?.trim(),
              teams,
            });
          }
          series.push({
            title: (
              await schedule.$eval(".schedule-date", (node) => node.textContent)
            )?.trim(),
            fixtures,
          });
        }
        console.log(series);
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
