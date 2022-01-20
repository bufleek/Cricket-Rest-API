from dataclasses import replace
from pyppeteer import launch
from pyppeteer.browser import Browser
from pyppeteer.page import Page, ElementHandle


class Scrapper:
    results_url = "https://www.news18.com/cricketnext/results/"

    def __init__(self):
        self.browser = None
        self.page = None

    async def init_scrapper(self):
        if self.browser is None:
            self.browser: Browser = await launch(headless=True)
        if self.page is None:
            self.page: Page = await self.browser.newPage()
            self.page.setDefaultNavigationTimeout(0)
            await self.page.setViewport({"width": 1280, "height": 800})

    async def get_results(self):
        await self.init_scrapper()
        page = self.page
        if page.url != self.results_url:
            await page.goto(self.results_url, {"waitUntil": "domcontentloaded"})
            await page.waitForSelector(".world-series-schedule")
            series_results = await page.querySelectorAll(".schedule-row")

            async def get_series_result_data(series_result: ElementHandle):
                series_title_element = await series_result.querySelector(
                    ".schedule-date"
                )
                series_title = await page.evaluate(
                    "(element) => element.textContent", series_title_element
                )
                fixtures_elements = await series_result.querySelectorAll(
                    ".series_result"
                )
                for fixture_element in fixtures_elements:
                    team_a_info_element = await fixture_element.querySelector(
                        ".result_flag_row:nth-child(1)"
                    )
                    team_b_info_element = await fixture_element.querySelector(
                        ".result_flag_row:nth-child(2)"
                    )
                    team_a = await page.evaluate(
                        "(element) => element.textContent",
                        (await team_a_info_element.querySelector(".series_name")),
                    )
                    team_b = await page.evaluate(
                        "(element) => element.textContent",
                        (await team_b_info_element.querySelector(".series_name")),
                    )
                    team_a_results = await page.evaluate(
                        "(element) => element.textContent",
                        (await team_a_info_element.querySelector(".series_run")),
                    )
                    team_b_results = await page.evaluate(
                        "(element) => element.textContent",
                        (await team_b_info_element.querySelector(".series_run")),
                    )
                    team_a_image = await page.evaluate(
                        '(element) => element.getAttribute("src")',
                        (
                            await team_a_info_element.querySelector(
                                ".flag_icons_result img"
                            )
                        ),
                    )
                    team_b_image = await page.evaluate(
                        '(element) => element.getAttribute("src")',
                        (
                            await team_b_info_element.querySelector(
                                ".flag_icons_result img"
                            )
                        ),
                    )
                    fixture_info = await page.evaluate(
                        "element => element.textContent",
                        (await fixture_element.querySelector(".schedule-info")),
                    )
                    status_note = await page.evaluate(
                        "element => element.textContent",
                        (await fixture_element.querySelector(".run_info")),
                    )
                    links_elements = await fixture_element.querySelectorAll(
                        ".check_list a"
                    )
                    links = []
                    for link_element in links_elements:
                        links.append(
                            await page.evaluate(
                                "element => element.textContent", link_element
                            )
                        )
                    print(
                        {
                            "series": series_title,
                            "team_a": {
                                "name": team_a,
                                "results": team_a_results,
                                "image": team_a_image,
                            },
                            "team_b": {
                                "name": team_b,
                                "results": team_b_results,
                                "image": team_b_image,
                            },
                            "info": fixture_info,
                            "status_note": status_note,
                            "links": links,
                        }
                    )

            for series_result in series_results:
                await get_series_result_data(series_result)

            await self.browser.close()

    async def get_full_scorecard(self):
        await self.init_scrapper()
        page = await self.browser.newPage()
        await page.goto(
            "https://www.news18.com/cricketnext/cricket-live-scorecard/india-under-19-vs-ireland-under-19-live-score-full-inuiru01192022207899.html",
            waitUntil="domcontentloaded",
        )
        await page.waitForSelector(".quickScore-box")

        scorecards = []

        scorecard_elements = await page.querySelectorAll(".quickScore-box")
        for scorecard_element in scorecard_elements:
            team_name_with_score = await page.evaluate(
                "element => element.textContent",
                (await scorecard_element.querySelector(".teamname")),
            )
            team_score = await page.evaluate(
                "element => element.textContent",
                (await scorecard_element.querySelector(".teamname span")),
            )
            team_name = team_name_with_score.replace(team_score, "").strip()

            overs_str = await page.evaluate(
                "element => element.textContent",
                await scorecard_element.querySelector(".over"),
            )
            runrate_str = await page.evaluate(
                "element => element.textContent",
                await scorecard_element.querySelector(".over span"),
            )
            overs = (
                overs_str.replace(runrate_str, "")
                .replace("(", "")
                .replace("OV)", "")
                .strip()
            )
            runrate = runrate_str.replace("RR", "").strip()

            fows = await page.evaluate(
                "element => element.textContent",
                (await scorecard_element.querySelector(".fallWickets-txt")),
            )

            extras_total = (
                await page.evaluate(
                    "element => element.textContent",
                    (await scorecard_element.querySelector(".extra-run .heading")),
                )
            ).replace("Extras: ", "")

            extras_split = (
                (
                    await page.evaluate(
                        "element => element.textContent",
                        (await scorecard_element.querySelector(".extra-run p")),
                    )
                )
                .replace("(", "")
                .replace(")", "")
                .replace(" ", "")
                .split(sep=",")
            )
            extras = {
                "total": extras_total,
            }
            for split in extras_split:
                extra_split = split.split(sep="-")
                extras[extra_split[0]] = extra_split[1]

            scorecard = {
                "team": team_name,
                "results": {
                    "scores": team_score,
                    "overs": overs,
                    "runrate": runrate,
                },
                "extras": extras,
                "fow": fows,
            }

            tables = await scorecard_element.querySelectorAll(".match-table")

            for table in tables:
                table_headings = []
                theads_els = await table.querySelectorAll("thead tr th")
                for thead_el in theads_els:
                    table_headings.append(
                        await page.evaluate("element => element.textContent", thead_el)
                    )

                tr_els = await table.querySelectorAll("tbody tr")
                table_data = []
                for tr in tr_els:
                    tr_data = {}
                    td_els = await tr.querySelectorAll("td")
                    for index, th in enumerate(table_headings):
                        if index == 0:
                            if th == "Batsman":
                                tr_data[th] = {
                                    "img": await page.evaluate(
                                        "element => element.getAttribute('src')",
                                        (await td_els[index].querySelector(".img img")),
                                    ),
                                    "profile_url": await page.evaluate(
                                        "element => element.getAttribute('href')",
                                        (await td_els[index].querySelector(".img a")),
                                    ),
                                    "name": await page.evaluate(
                                        "element => element.textContent",
                                        await td_els[index].querySelector(
                                            ".txt .playername"
                                        ),
                                    ),
                                    "status": await page.evaluate(
                                        "element => element.textContent",
                                        await td_els[index].querySelector(
                                            ".txt .playstatus"
                                        ),
                                    ),
                                }

                            else:
                                tr_data[th] = await page.evaluate(
                                    "element => element.textContent", td_els[index]
                                )
                        else:
                            tr_data[th] = await page.evaluate(
                                "element => element.textContent", td_els[index]
                            )
                    table_data.append(tr_data)

                scorecard[table_headings[0]] = table_data
            scorecards.append(scorecard)
        print(scorecards)
