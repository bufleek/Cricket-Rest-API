import asyncio
from pyppeteer import launch


async def main():
    browser = await launch(headless=False)
    page = await browser.newPage()
    page.setDefaultNavigationTimeout(0)
    await page.setViewport({"width": 1280, "height": 800})
    await page.goto("https://www.news18.com/", {"waitUntil": "domcontentloaded"})
    await page.screenshot({"path": "example.png"})
    await browser.close()


asyncio.get_event_loop().run_until_complete(main())
