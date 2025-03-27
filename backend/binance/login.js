async function login(browser, page) {
  try {
    await page.setRequestInterception(false);

    // Visit square page first
    await page.goto("https://www.binance.com/square", {
      waitUntil: "networkidle2",
    });
    const detected = await Promise.race([
      detectSelector(page, "button.news-post-button").then((button) => ({
        type: "post",
        button,
      })),
      detectSelector(page, "button.bn-button.bn-button__secondary").then(
        (button) => ({
          type: "login",
          button,
        })
      ),
    ]);

    // Have logined before
    if (detected.type === "post") return "-1";

    // Click loginButton
    if (detected.type !== "login") {
      console.error("Can't find login button");
      return null;
    }
    await new Promise((r) => setTimeout(r, 200));
    await detected.button.click({ force: true });
    console.log("loginButton clicked");

    // Get Binance QRCode
    await page.waitForSelector(".qrcode-login-popup", { visible: true });
    await new Promise((r) => setTimeout(r, 800));
    await page.click(".qrcode-login-popup", { force: true });
    await new Promise((r) => setTimeout(r, 1200));
    await page.waitForSelector("canvas", { visible: true });
    const qrCode = await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      return canvas.toDataURL("image/png");
    });

    console.log("Wait user to scan QR code!");
    return qrCode;
  } catch (error) {
    console.error("Login Failed:", error);
    throw error;
  }
}

async function detectSelector(page, selector) {
  try {
    return await page.waitForSelector(selector, {
      visible: true,
    });
  } catch {
    return null;
  }
}

module.exports = login;
