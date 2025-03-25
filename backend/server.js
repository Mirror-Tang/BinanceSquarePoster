require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const initPuppeteer = require("./puppeteer/initPuppeteer");
const launchBinance = require("./binance/launch");
const setTwitter = require("./twitter/setAddress");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let browser = null; // headless browser
let isReady = false; // browser started or not
let login_started = false;

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
    const username = req.query.username.replace(/^@/, ""); // 移除前导 @

    if (!/^[a-zA-Z0-9_]{1,49}$/.test(username)) {
      return res.status(400).json({
        error: "Invalid Twitter username",
      });
    }

    const { avatar, name } = await setTwitter(browser, username);
    console.log(avatar, name);
    if (avatar !== null) res.json({ avatar: avatar, name: name });
    else res.status(500).json({ error: "Failed to set twitter address" });
  } catch (error) {
    console.error("Error setting twitter address:", error);
    res.status(500).json({ error: "Failed to set twitter address" });
  }
});

// Login (Binance)
app.get("/api/login", async (_, res) => {
  if (!isReady) {
    return res.status(503).json({ error: "Browser not ready" });
  }
  try {
    if (login_started)
      return res.status(503).json({ error: "Repeated requests" });
    login_started = true;
    qrcode = await launchBinance(browser);
    if (qrcode !== null) res.json({ qrcodeUrl: qrcode });
    else res.status(500).json({ error: "Failed to get Binance QR code" });
  } catch (error) {
    console.error("Error getting QR code:", error);
    res.status(500).json({ error: "Failed to get Binance QR code" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhoust:${PORT}`);
});
