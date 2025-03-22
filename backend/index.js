const launchBinance = require("./binance/launch");

(async () => {
  const username = "a";
  const password = "b";
  const content = "何一姐好呀！这里是 ZEROBASE。";

  await launchBinance(username, password, content);
})();
