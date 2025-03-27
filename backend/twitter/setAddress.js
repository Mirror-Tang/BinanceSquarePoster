// TODO: 解析防御，目前本地版先假定没有傻子自己攻击自己

async function setAddress(browser, username) {
  // console.log("setAddress");
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 960 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    const url = `https://nitter.net/${encodeURIComponent(username)}`;
    await page.goto(url, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 777));
    await Promise.all([
      page.waitForSelector(".profile-card-avatar > img"),
      page.waitForSelector(".profile-card-fullname"),
    ]);
    await new Promise((r) => setTimeout(r, 333));
    const [avatar, name] = await page.evaluate(() => {
      const imgElement = document.querySelector(".profile-card-avatar > img");
      const nameElement = document.querySelector(".profile-card-fullname");
      return [
        imgElement ? imgElement.src : null,
        nameElement ? nameElement.textContent.trim() : null,
      ];
    });
    if (!avatar || !name) {
      throw new Error(`无法获取 Twitter 资料（用户 ${username} 可能不存在）`);
    }
    return { page, avatar, name };
  } catch (error) {
    console.error("Something wrong when setting twitter address:", error);
    return null;
  }
}

module.exports = setAddress;
