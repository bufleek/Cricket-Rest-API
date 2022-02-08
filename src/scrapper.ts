import puppeteer, { Browser } from "puppeteer";

export default class Scrapper {
  private static instance: Scrapper;
  public static browser: Browser;

  private constructor() {}

  public static getInstance(): Scrapper {
    if (Scrapper.instance == null) {
      Scrapper.instance = new Scrapper();
    }

    return Scrapper.instance;
  }

  public async initializeScrapper() {
    if (Scrapper.browser == null) {
      Scrapper.browser = await puppeteer.launch({ headless: false });
    }
  }
}
