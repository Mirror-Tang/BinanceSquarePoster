const puppeteer = require("puppeteer");

async function initPuppeteer(userDataDir) {
  // Open browser
  const browser = await puppeteer.launch({
    headless: false, // TODO
    userDataDir,
    // args: ["--no-sandbox", "--disable-setuid-sandbox"],
    // ignoreDefaultArgs: ['--disable-extensions'],
  });
  return browser;
}

module.exports = initPuppeteer;
