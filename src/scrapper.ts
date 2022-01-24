import puppeteer, { Browser } from "puppeteer";

interface DynamicObject<T> {
  [key: string]: T;
}

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
      Scrapper.browser = await puppeteer.launch({ headless: true });
    }
  }

  public async getResults() {
    let run = async () => {
      await this.initializeScrapper();
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
        await run();
      }
    };
    await run();
  }

  public async getScorecard(url: string) {
    await this.initializeScrapper();
    let page = await Scrapper.browser.newPage();
    const run = async () => {
      try {
        await page.goto(url);
        await page.waitForSelector(".scoreCard-main");
        let status = (
          await page.$eval(".matchStatus", (node) => node.textContent)
        )?.trim();
        let info = await page.$eval(
          ".match-headingwrap .heading-2",
          (node) => node.textContent
        );
        let match_subtitle = info?.split(",", 1)[0].trim() || null;
        let status_note = await page.$eval(
          ".final-resultbtn",
          (node) => node.textContent
        );
        let scoreboard_boxes = await page.$$(".quickScore-box");
        let scoreboards = [];
        for (let i = 0; i < scoreboard_boxes.length; i++) {
          let scoreboard_box = scoreboard_boxes[i];
          let image_url = await scoreboard_box.$eval(".flag img", (node) =>
            node.getAttribute("src")
          );
          let team_score = await scoreboard_box.$eval(
            ".teamname",
            (node) => node.textContent
          );
          let score = await scoreboard_box.$eval(
            ".teamname span",
            (node) => node.textContent
          );
          let teamname = team_score?.replace("" + score, "").trim();
          let over_rr = await scoreboard_box.$eval(
            ".over",
            (node) => node.textContent
          );
          let rr = await scoreboard_box.$eval(
            ".over span",
            (node) => node.textContent
          );
          let over = over_rr
            ?.replace("" + rr, "")
            .replace("(", "")
            .replace(")", "")
            .trim();
          let fallofwickets = (
            await scoreboard_box.$eval(
              ".fallWickets-txt",
              (node) => node.textContent
            )
          )?.trim();
          let extras_total = (
            await scoreboard_box.$eval(
              ".extra-run .heading",
              (node) => node.textContent
            )
          )
            ?.replace("Extra:", "")
            .trim();
          let extras_split = (
            await scoreboard_box.$eval(
              ".extra-run p",
              (node) => node.textContent
            )
          )
            ?.replace("(", "")
            .replace(")", "")
            .replace(" ", "")
            .split(",");
          let extra: DynamicObject<string> = {};
          extra["total"] = extras_total?.replace("Extras:", "").trim() || "";
          extras_split?.forEach((split) => {
            let xtra = split.split("-", 2);
            extra[xtra[0].trim()] = xtra[1].trim();
          });

          let scoreboard: DynamicObject<any> = {};
          scoreboard["teamname"] = teamname || "";
          scoreboard["image_url"] = image_url || "";
          scoreboard["score"] = score || "";
          scoreboard["runrate"] = rr?.replace("RR", "").trim() || "";
          scoreboard["over"] = over?.trim() || "";
          scoreboard["fow"] = fallofwickets?.trim() || "";
          scoreboard["extras"] = extra || "";

          let match_tables = await scoreboard_box.$$(".match-table");
          for (let j = 0; j < match_tables.length; j++) {
            let match_table = match_tables[j];
            let ths = await match_table.$$eval("thead th", (nodes) =>
              nodes.map((node) => node.textContent || "")
            );
            let records = [];
            let trs = await match_table.$$("tbody tr");
            for (let k = 0; k < trs.length; k++) {
              let tr = trs[k];
              let record: DynamicObject<any> = {};
              let tds = await tr.$$("td");
              for (let l = 0; l < ths.length; l++) {
                let th = ths[l].toLocaleLowerCase();
                if (th == "4s") {
                  th = "f";
                } else if (th == "6s") {
                  th = "s";
                } else if (th == "bowlers") {
                  th = "bowler";
                }
                if (l == 0 && th == "batsman") {
                  record[th] = {
                    name: await tds[l].evaluate(
                      (node) => node.textContent || ""
                    ),
                    status: await tds[l].$eval(".playstatus", (node) =>
                      node.textContent?.trim()
                    ),
                  };
                } else {
                  record[th] = await tds[l].evaluate(
                    (node) => node.textContent || ""
                  );
                }
              }
              record["active"] = await tr.evaluate((node) =>
                node.classList.contains("active")
              );
              records.push(record);
            }
            let th = ths[0].trim().toLocaleLowerCase();
            if (th == "bowlers") {
              th = "bowling";
            } else if (th == "batsman") {
              th = "batting";
            }
            scoreboard[th] = records;
          }
          scoreboards.push(scoreboard);
        }
        let full_scoreboard = {
          status,
          match_subtitle,
          status_note,
          scoreboards,
        };
        console.log(full_scoreboard);
      } catch (error) {
        console.error(error);
        await run();
      }
    };
    await run();
  }
}
