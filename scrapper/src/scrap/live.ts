import { Page } from "puppeteer";
import { updateLive } from "../api";
import Scrapper from "../scrapper";
import { Batting, Bowling, Fixture, Inning, Score } from "../types";
import { stripMatchInfo } from "./utils/fixture";

// const insert = (data: any) => {
//   fs.writeFileSync("./data/live.json", JSON.stringify(data));
// };
// const insertScorecard = (data: any, fixture_id: number) => {
//   fs.writeFileSync(`./data/scorecard_${fixture_id}.json`, JSON.stringify(data));
// };

class Live {
  public async streamFixture(fixture: any, url: string) {
    let run = async () => {
      let page = await Scrapper.browser.newPage();
      try {
        await page.close();
      } catch (error) {
        await page.close();
        await run();
      }
    };
  }

  public async getLiveFixtures(page: Page): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      let run = async () => {
        try {
          await page.waitForSelector(".CN-result-row");

          let seriesEls = await page.$$(".CN-result-row");
          let series: any[] = [];

          await Promise.all(
            seriesEls.map(
              (seriesEl) =>
                new Promise(async (resolve_srs, _) => {
                  let seriesTitle = await seriesEl.$eval(
                    ".CN-result-heading",
                    (node) => node.textContent
                  );
                  let fixtureEls = await seriesEl.$$(".result-box");
                  let fixtures: any[] = [];

                  await Promise.all(
                    fixtureEls.map(
                      (fixtureEl) =>
                        new Promise(async (resolve_fx, _) => {
                          let teamNames = await fixtureEl.$$eval(
                            ".teamName",
                            (nodes) => nodes.map((node) => node.textContent)
                          );
                          let fixtureInfo = await fixtureEl.$eval(
                            ".cn-rsltCont",
                            (node) => node.textContent
                          );
                          let info = stripMatchInfo(fixtureInfo || "");
                          info.date &&
                            info.date.setFullYear(new Date().getFullYear());
                          let image_urls = await fixtureEl.$$eval(
                            ".result-teambox .flag object",
                            (nodes) =>
                              nodes.map((node) => node.getAttribute("data"))
                          );
                          let links = (
                            await fixtureEl.$$eval(
                              ".result-col-r ul li a",
                              (nodes) =>
                                nodes.map((node) => node.getAttribute("href"))
                            )
                          ).map((link) =>
                            link != null
                              ? `https://www.news18.com${link}`
                              : null
                          );
                          let scoreIds = await fixtureEl.$$eval(
                            ".scoreWrap ul",
                            (nodes) => nodes.map((node) => node.id)
                          );
                          await Promise.all(
                            scoreIds.map(
                              (id) =>
                                new Promise(async (resolve, _) => {
                                  try {
                                    await page.waitForSelector(
                                      `#${id} .scorebox`
                                    );
                                  } catch (_) {}
                                  resolve(null);
                                })
                            )
                          );
                          let scores = await fixtureEl.$$eval(
                            ".scorebox",
                            (nodes) => nodes.map((node) => node.textContent)
                          );
                          let scores_info = scores.map((score) => {
                            let split_score = score ? score.split("(") : [];
                            return {
                              score:
                                split_score && split_score[0]
                                  ? split_score[0]
                                  : null,
                              overs:
                                split_score && split_score[1]
                                  ? split_score[1].replace("OV)", "").trim()
                                  : null,
                            };
                          });
                          let teamAScore = scores[0] && scores[0].trim();
                          let teamBScore = scores[1] && scores[1].trim();

                          let fixture = {
                            status:
                              teamAScore === "" && teamBScore === ""
                                ? "SCHEDULED"
                                : "LIVE",
                            team_a: {
                              name: teamNames[0],
                              logo_url: image_urls[0],
                              full_score: scores[0] && scores[0].trim(),
                              ...scores_info[0],
                            },
                            team_b: {
                              name: teamNames[1],
                              logo_url: image_urls[1],
                              full_score: (scores[1] || "").trim(),
                              ...scores_info[1],
                            },
                            ...info,
                            scorecard_url: links[0],
                            commentary_url: links[1],
                            squads_url: links[2],
                          };

                          fixtures.push(fixture);
                          resolve_fx(fixtures);
                        })
                    )
                  );
                  series.push({ title: seriesTitle, fixtures });
                  resolve_srs(series);
                })
            )
          );

          // insert(series);
          resolve(series);
        } catch (error) {
          // console.log(error);
          reject("");
        }
      };
      await run();
    });
  }

  public async getLiveScorecard(page: Page, _fixture: any): Promise<any> {
    return new Promise(async (resolve_scorecard, reject) => {
      const run = async () => {
        try {
          await page.goto(_fixture.scorecard_url, {
            waitUntil: "networkidle0",
            timeout: 90000,
          });

          let activeTab = await page.$eval(
            ".cricket_tablinks li.active a",
            (node) => node.textContent
          );
          if (activeTab != "Full Scorecard") {
            _fixture.scorecard_url = await page.$eval(
              ".cricket_tablinks li:nth-child(2) a",
              (node) => node.getAttribute("href")
            );
            await page.goto(_fixture.scorecard_url, {
              waitUntil: "networkidle0",
              timeout: 90000,
            });
          }
          await page.waitForSelector(".full_scorecard");
          const fullScorecardEl = await page.$(".full_scorecard");
          const scrapStartTime = Date.now();
          let status = "";
          let status_note = "";
          let matchEnded = false;

          const scrap = async () => {
            let scoresPromise = new Promise<Score[]>(async (resolve, _) => {
              await page.waitForSelector(".match-status");
              status =
                (fullScorecardEl &&
                  (await fullScorecardEl.$eval(
                    ".match-status",
                    (node) => node.textContent
                  ))) ||
                "";

              try {
                status_note =
                  (fullScorecardEl &&
                    (await fullScorecardEl.$eval(
                      ".final-resultbtn",
                      (node) => node.textContent
                    ))) ||
                  "";
              } catch (_) {}

              let scores = await Promise.all(
                (
                  (fullScorecardEl &&
                    (await fullScorecardEl.$$(".socrebox-inner"))) ||
                  []
                ).map(
                  (scorebox) =>
                    new Promise<Score>(async (resolve, _) => {
                      let teamName = await scorebox.$eval(
                        ".teamName",
                        (node) => node.textContent
                      );
                      let _score = await scorebox.$eval(
                        ".teamRun",
                        (node) => node.textContent
                      );
                      // let logo_url = await scorebox.$eval("img.teamflag", (node) =>
                      //   node.getAttribute("src")
                      // );
                      let rr = await scorebox.$eval(
                        ".teamRunRate",
                        (node) => node.textContent
                      );
                      let rRSplit = rr && rr.split(" ");
                      let overs = rRSplit && rRSplit[0] ? rRSplit[0] : null;
                      let full_score =
                        _score && overs ? `${_score} ${overs}` : "";
                      overs && overs.replace("(", "").replace(")", "");
                      let runrate = rRSplit && rRSplit[2] ? rRSplit[2] : "";

                      let _team =
                        _fixture.team_a.name === teamName
                          ? _fixture.team_a
                          : _fixture.team_b;

                      let score: Score = {
                        full_score,
                        score: _score,
                        overs,
                        runrate,
                        team: _team.id,
                        fixture: _fixture.id,
                      };
                      resolve(score);
                    })
                )
              );

              resolve(scores);
            });

            let accordions = await page.$$(".accordion");
            let inningsPromise = Promise.all(
              accordions.map(
                (accordion) =>
                  new Promise<Inning>(async (resolve, _) => {
                    let score = await accordion.$eval(
                      ".teamname span",
                      (node) => node.textContent
                    );
                    let teamName = (
                      (await accordion.$eval(
                        ".teamname",
                        (node) => node.textContent
                      )) || ""
                    )
                      .replace(score || "", "")
                      .trim();
                    let inning_title = await accordion.$eval(
                      ".inning_row .inning",
                      (node) => node.textContent
                    );

                    const team =
                      _fixture.team_a.name === teamName
                        ? _fixture.team_a
                        : _fixture.team_b;

                    let match_tables = await accordion.$$(".match-table");
                    let batting: Batting[] = [];
                    let bowling: Bowling[] = [];
                    let fall_of_wickets = await accordion.$eval(
                      ".fall_wickets",
                      (node) => node.textContent
                    );

                    await Promise.all(
                      match_tables.map(
                        (match_table) =>
                          new Promise(async (resolve, _) => {
                            const tableType = await match_table.$eval(
                              "thead th:nth-child(1)",
                              (node) => node.textContent || ""
                            );
                            const trs = await match_table.$$("tbody tr");
                            for (let i = 0; i < trs.length; i++) {
                              const tr = trs[i];
                              const tds = await tr.$$eval("td", (nodes) =>
                                nodes.map((node) => node.textContent)
                              );
                              const playerName = (
                                (await tr.$eval(
                                  "td .playername",
                                  (node) => node.textContent
                                )) || ""
                              ).trim();
                              if (tableType.toLocaleLowerCase() === "batsman") {
                                const playstatus = await tr.$eval(
                                  "td .playstatus",
                                  (node) => node.textContent
                                );

                                batting.push({
                                  batsman: playerName || "",
                                  runs: (tds[1] || "").trim() || "",
                                  balls: (tds[2] || "").trim() || "",
                                  fours: (tds[3] || "").trim() || "",
                                  sixes: (tds[4] || "").trim() || "",
                                  strike_rate: (tds[5] || "").trim() || "",
                                  out: playstatus || "",
                                  active: await tr.evaluate((node) =>
                                    node.classList.contains("active")
                                  ),
                                  team: team.id,
                                  fixture: _fixture.id,
                                });
                              } else if (
                                tableType.toLocaleLowerCase() === "bowlers"
                              ) {
                                bowling.push({
                                  bowler: playerName || "",
                                  overs: (tds[1] || "").trim() || "",
                                  maidens: (tds[2] || "").trim() || "",
                                  runs: (tds[3] || "").trim() || "",
                                  wickets: (tds[4] || "").trim() || "",
                                  wides: (tds[5] || "").trim() || "",
                                  no_balls: (tds[6] || "").trim() || "",
                                  econs: (tds[7] || "").trim() || "",
                                  active: await tr.evaluate((node) =>
                                    node.classList.contains("active")
                                  ),
                                  team: team.id,
                                  fixture: _fixture.id,
                                });
                              }
                            }
                            resolve(null);
                          })
                      )
                    );
                    const inning: Inning = {
                      id: null,
                      batting,
                      bowling,
                      fall_of_wickets: fall_of_wickets || "",
                      fixture: _fixture.id,
                      team: team.id,
                      inning: inning_title || "",
                    };
                    resolve(inning);
                  })
              )
            );

            const data = await Promise.all([scoresPromise, inningsPromise]);

            matchEnded = status.trim().toLocaleUpperCase() === "CONCLUDED";

            const fixture: Fixture = {
              id: _fixture.id,
              status,
              status_note,
              date: _fixture.date,
              series: _fixture.series.id,
              team_a: _fixture.team_a.id,
              team_b: _fixture.team_b.id,
              scores: data[0],
              venue: _fixture.venue.id,
              innings: data[1],
              featured: !matchEnded,
            };

            await updateLive(fixture);

            if (Date.now() - scrapStartTime < 900000 && !matchEnded) {
              await new Promise((resolve, _) => {
                setTimeout(() => {
                  resolve(null);
                }, 10000);
              });
              await scrap();
            } else if (matchEnded) {
              await page.close();
            }
          };

          if (status.trim().toLocaleUpperCase() !== "CONCLUDED") {
            await scrap();
            await run();
          }
        } catch (err) {
          // console.log(err);
          await run();
        }
      };
      await run();
      resolve_scorecard(_fixture);
    });
  }
}

export default Live;
