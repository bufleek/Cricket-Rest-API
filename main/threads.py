import threading, asyncio
from pyppeteer import launch
from .scrapper import Scrapper


class ScrapperThread(threading.Thread):
    def run(self):
        scrapper = Scrapper()
        asyncio.run(scrapper.get_results())
