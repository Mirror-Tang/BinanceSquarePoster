const login = require("./login");
const waitScan = require("./waitScan");
const postContent = require("./post");

async function launch(browser) {
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 960 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    const qrcode = await login(browser, page);
    waitScan(browser, page);
    return [page, qrcode];
  } catch (error) {
    console.error("Something wrong when launch Binance poster:", error);
    return null;
  }
}

module.exports = launch;
