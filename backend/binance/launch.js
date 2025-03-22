require("dotenv").config();
const login = require("./login");
const postContent = require("./post");

async function launch(userDataDir, username, password, content) {
  const initPuppeteer = require("../puppeteer/initPuppeteer");
  const { browser, page } = await initPuppeteer(userDataDir);
  try {
    await login(browser, page, username, password); // Login Page
  } catch (e) {
    console.error("Something wrong on Binance:", e);
  } finally {
    // TODO
    // await browser.close();
  }
}

module.exports = launch;
