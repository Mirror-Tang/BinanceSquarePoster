async function post(browser, content) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 960 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );
  await page.goto("https://www.binance.com/square");

  await page.type(".ProseMirror", content);

  const postButton = await page.evaluateHandle(() => {
    const toolbar = document.querySelector("div.editor-toolbar-container");
    if (toolbar) {
      const nextSibling = toolbar.nextElementSibling;
      if (nextSibling) {
        return nextSibling.querySelector("button");
      }
    }
    return null;
  });

  if (!postButton) {
    const errorContent = "Can't find post button.";
    console.error(errorContent);
    return errorContent;
  }

  await new Promise((r) => setTimeout(r, 1500));
  await postButton.click({ force: true });
  console.log("Post the content:", content);
  await page.close();
}

module.exports = post;
