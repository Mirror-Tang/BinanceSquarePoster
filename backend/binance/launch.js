const login = require("./login");
const postContent = require("./post");

async function launch(username, password, content) {
  const initPuppeteer = require("../puppeteer/initPuppeteer");
  const { browser, page } = await initPuppeteer();
  try {
    await login(browser, page, "a", "b");
  } catch (e) {
    console.error("Something wrong on Binance:", e);
  } finally {
    await browser.close();
  }
}

module.exports = launch;
