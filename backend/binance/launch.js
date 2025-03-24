const login = require("./login");
const postContent = require("./post");

async function launch(browser) {
  try {
    const page = await browser.newPage();
    const qrcode = await login(browser, page);
    return qrcode;
  } catch (error) {
    console.error("Something wrong when launch Binance poster:", error);
    return null;
  }
}

module.exports = launch;
