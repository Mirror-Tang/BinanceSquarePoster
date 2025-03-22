const puppeteer = require("puppeteer");

async function initPuppeteer(userDataDir) {
  // Get user data
  console.log("userDataDir:", userDataDir);

  //Open browser
  const browser = await puppeteer.launch({
    headless: false, // TODO
    userDataDir,
    // args: ["--no-sandbox", "--disable-setuid-sandbox"],
    // ignoreDefaultArgs: ['--disable-extensions'],
  });
  const page = await browser.newPage();
  return { browser, page };
}

module.exports = initPuppeteer;
