import { Page } from "puppeteer";
import DynamicObject from "../dynamic_object";
import Scrapper from "../scrapper";

export default class ScoreCard {
  private scrapper = Scrapper.getInstance();

  public async getScorecard(
    url: string,
    scorecardPage: Page | null
  ): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      const run = async () => {
        await this.scrapper.initializeScrapper();
        let page = scorecardPage || (await Scrapper.browser.newPage());

        try {
          await page.goto(url, { waitUntil: "networkidle0", timeout: 90000 });
          await page.waitForSelector(".scoreCard-main");
          let status = (
            (await page.$eval(".matchStatus", (node) => node.textContent)) || ""
          ).trim();
          let info = await page.$eval(
            ".match-headingwrap .heading-2",
            (node) => node.textContent
          );
          let match_subtitle = (info || "").split(",", 1)[0].trim() || null;
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
            let teamname = (team_score || "").replace("" + score, "").trim();
            let over_rr = await scoreboard_box.$eval(
              ".over",
              (node) => node.textContent
            );
            let rr = await scoreboard_box.$eval(
              ".over span",
              (node) => node.textContent
            );
            let over = (over_rr || "")
              .replace("" + rr, "")
              .replace("(", "")
              .replace(")", "")
              .trim();
            let fallofwickets = (
              (await scoreboard_box.$eval(
                ".fallWickets-txt",
                (node) => node.textContent
              )) || ""
            ).trim();
            let extras_total = (
              (await scoreboard_box.$eval(
                ".extra-run .heading",
                (node) => node.textContent
              )) || ""
            )
              .replace("Extra:", "")
              .trim();
            let extras_split = (
              (await scoreboard_box.$eval(
                ".extra-run p",
                (node) => node.textContent
              )) || ""
            )
              .replace("(", "")
              .replace(")", "")
              .replace(" ", "")
              .split(",");
            let extra: DynamicObject<string> = {};
            extra["total"] = extras_total.replace("Extras:", "").trim() || "";
            extras_split.forEach((split) => {
              let xtra = split.split("-", 2);
              extra[xtra[0].trim()] = xtra[1].trim();
            });

            let scoreboard: DynamicObject<any> = {};
            scoreboard["teamname"] = teamname || "";
            scoreboard["image_url"] = image_url || "";
            scoreboard["score"] = score || "";
            scoreboard["runrate"] = (rr || "").replace("RR", "").trim() || "";
            scoreboard["over"] = over.trim() || "";
            scoreboard["fow"] = fallofwickets.trim() || "";
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
                        (node.textContent || "").trim()
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
          await page.close();
          resolve(full_scoreboard);
        } catch (error) {
          // console.error(error);
          await page.close();
          await run();
        }
      };
      await run();
    });
  }
}
