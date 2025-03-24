async function login(browser, page) {
  try {
    await page.setRequestInterception(false);

    // Enter square page first
    await page.goto("https://www.binance.com/square", {
      waitUntil: "networkidle2",
    });

    // Click loginButton
    const loginButton = await page.waitForSelector(
      "button.bn-button.bn-button__secondary",
      { visible: true }
    );
    if (!loginButton) {
      console.error("Can't find login button");
      return null;
    }
    await new Promise((r) => setTimeout(r, 200));
    await loginButton.click({ force: true });
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
    console.log("qrCode:", qrCode);

    console.log("Wait user to scan QR code!");
    return qrCode;
  } catch (error) {
    console.error("Login Failed:", error);
    throw error;
  }
}

module.exports = login;
