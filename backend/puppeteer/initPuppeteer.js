const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

async function initPuppeteer(userDataDir) {
  // Open browser
  const browser = await puppeteer.launch({
    headless: true, // TODO
    userDataDir,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    ignoreDefaultArgs: ["--disable-extensions"],
  });
  return browser;
}

module.exports = initPuppeteer;
