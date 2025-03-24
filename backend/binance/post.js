async function post(page, content) {
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

  await new Promise((r) => setTimeout(r, 500));
  await postButton.click({ force: true });
  console.log("PostButton clicked.");
}
