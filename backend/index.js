const launchBinance = require("./binance/launch");
const path = require("path");
const userDataDir = path.join(__dirname, "puppeteer/puppeteer_user_data");

(async () => {
  const username = process.env.GOOGLE_USERNAME;
  const password = process.env.GOOGLE_PASSWORD;
  const content = "何一姐好呀！这里是 ZEROBASE。";

  await launchBinance(userDataDir, username, password, content);
})();
