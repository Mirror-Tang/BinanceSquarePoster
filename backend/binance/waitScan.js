// 处理「保持登录状态界面」的弹窗
async function handleStayLoggedIn(page) {
  try {
    // console.log("处理 保持登录状态界面 的弹窗");
    const stayView = await page.waitForSelector(".stay-signed-in-checkbox", {
      visible: true,
      timeout: 1000 * 60 * 15,
    });

    if (stayView) {
      await page.waitForSelector(".bn-button__primary", { visible: true });
      await new Promise((r) => setTimeout(r, 120));
      await page.click(".bn-button__primary", { force: true });
      console.log("Stay Logged In: Yes");
      return true;
    }
    return false;
  } catch (error) {
    console.log("Stay Logged In:", error);
    return false;
  }
}

async function waitScan(browser, page) {
  try {
    console.log("Begin to wait scan Binance QR code");
    await Promise.race([
      page.waitForFunction(() => window.location.href.includes("/square"), {
        timeout: 15 * 60 * 1000,
      }),
      (async () => {
        await handleStayLoggedIn(page);
        await page.waitForFunction(
          () => window.location.href.includes("/square"),
          {
            timeout: 2 * 60 * 1000,
          }
        );
      })(),
    ]);
    console.log("Binance logged in");
    // Start monitor
    try {
      console.log("Binance monitor try to start...");
      await fetch(`http://localhost:3000/api/monitor/start`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Binance monitor start error:", err);
    }
  } catch (error) {
    console.error(
      "Something wrong while waitting scane Binance QR code:",
      error
    );
  }
}

module.exports = waitScan;
