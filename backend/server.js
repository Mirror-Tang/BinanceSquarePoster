require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const initPuppeteer = require("./puppeteer/initPuppeteer");
const launchBinance = require("./binance/launch");
const setTwitter = require("./twitter/setAddress");
const TwitterMonitor = require("./twitter/monitor");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let browser = null; // headless browser
let isReady = false; // browser started or not
let login_started = false;
let twitterPage = null;
let twitterUsername = "mirrorzk";
let twitterMonitor = null;
let binanceLoginPage = null;

// Initialize headless browser
(async () => {
  try {
    console.log("Initializing browser in background...");
    const userDataDir = path.join(__dirname, "puppeteer/puppeteer_user_data");
    browser = await initPuppeteer(userDataDir);
    isReady = true;
    console.log("Browser ready in background");
  } catch (error) {
    console.error("Browser initialization failed:", error);
    process.exit(1);
  }
})();

// API check
app.get("/api/health", (_, res) => {
  res.json({
    ready: isReady,
    message: isReady ? "Browser ready" : "Browser initializing",
  });
});

// Set twitter address
app.get("/api/twitter", async (req, res) => {
  if (!isReady) {
    return res.status(503).json({ error: "Wait a minute! Browser not ready" });
  }
  try {
    twitterUsername = req.query.username.replace(/^@/, ""); // 移除前导 @

    if (!/^[a-zA-Z0-9_]{1,49}$/.test(twitterUsername)) {
      return res.status(400).json({
        error: "Invalid Twitter username",
      });
    }

    const { page, avatar, name } = await setTwitter(browser, twitterUsername);
    if (avatar !== null) {
      twitterPage = page;
      console.log("twitter page:", page);
      res.json({ avatar: avatar, name: name });
      if (binanceLoginPage) await binanceLoginPage.bringToFront();
    } else res.status(500).json({ error: "Failed to set twitter address" });
  } catch (error) {
    console.error("Error setting twitter address:", error);
    res.status(500).json({ error: "Failed to set twitter address" });
  }
});

// TODO: 改用 Websocket 实时推送最新进展到前端

// Login (Binance)
app.get("/api/login", async (_, res) => {
  if (!isReady) {
    return res.status(503).json({ error: "Browser not ready" });
  }
  try {
    if (login_started)
      return res.status(503).json({ error: "Repeated requests" });
    login_started = true;
    const [page, qrcode] = await launchBinance(browser);
    if (qrcode !== null) {
      binanceLoginPage = page;
      res.json({ qrcodeUrl: qrcode });
    } else {
      res.status(500).json({ error: "Failed to get Binance QR code" });
    }
  } catch (error) {
    console.error("Error getting QR code:", error);
    res.status(500).json({ error: "Failed to get Binance QR code" });
  }
});

app.post("/api/monitor/start", async (_, res) => {
  // TODO: 守护进程 & 前端查询接口
  if (!isReady) {
    return res.status(503).json({ error: "Browser not ready" });
  }
  try {
    if (twitterMonitor) {
      return res.json({ warning: "Monitor already running" });
    }
    if (!twitterUsername) {
      return res.status(400).json({ error: "Twitter username not set" });
    }

    twitterMonitor = new TwitterMonitor(browser);
    await twitterMonitor.start(twitterPage, twitterUsername);
    console.log("Twitter monitor start listening...");
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to start monitor:", error);
    res.status(500).json({ error: error.message });
  }
});

// TODO: 手动开启和关闭推流 API （现在直接结束后端就好啦~）

app.listen(PORT, () => {
  console.log(`Server running on http://localhoust:${PORT}`);
});
