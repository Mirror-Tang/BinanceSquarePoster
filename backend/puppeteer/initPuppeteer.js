const puppeteer = require("puppeteer");

async function initPuppeteer() {
  const browser = await puppeteer.launch({
    headless: false, // TODO
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  return { browser, page };
}

module.exports = initPuppeteer;
