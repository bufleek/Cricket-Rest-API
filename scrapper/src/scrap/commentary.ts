import Scrapper from "../scrapper";

export default class Commentary {
  private scrapper = Scrapper.getInstance();

  public async getCommentary(url: string) {
    let run = async () => {
      this.scrapper.initializeScrapper();
      let page = await Scrapper.browser.newPage();
      await page.goto(url);
      try {
        await page.close();
      } catch (error) {
        await page.close();
        await run();
      }
    };
    await run();
  }
}
