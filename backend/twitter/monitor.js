const { setIntervalAsync } = require("set-interval-async");
const postToBinance = require("../binance/post");

class TwitterMonitor {
  constructor(browser) {
    this.browser = browser;
    this.page = null;
    this.interval = null;
    this.lastTweetId = null;
    this.username = null;
    this.processing = false;
  }

  async start(page, username) {
    this.page = page;
    this.username = username;
    console.log(page, username);
    if (page === null || username === null) {
      console.error("Failed to get the page of Twitter, monitor stoped!");
      return;
    }

    await page.bringToFront();

    const tweets = await this.getLatestTweets();
    if (tweets.length > 0) {
      this.lastTweetId = tweets[0].id;
    }

    // Begin listening
    this.interval = setIntervalAsync(async () => {
      try {
        await page.bringToFront();
        const newTweets = await this.checkNewTweets();
        await this.processTweets(newTweets);
      } catch (error) {
        console.error("Begin listening error:", error);
      }
    }, 0.45 * 60 * 1000);
  }

  async getLatestTweets() {
    try {
      return await this.page.evaluate(() => {
        return Array.from(document.querySelectorAll(".timeline-item")).map(
          (el) => {
            const link = el.querySelector("a.tweet-link");
            const id = link?.href.match(/\/status\/(\d+)/)?.[1]; // TODO: 不会有人叫 status 吧？不会吧不会吧~
            return {
              id: id,
              text: el.querySelector(".tweet-content")?.textContent.trim(),
              time: el.querySelector(".tweet-date a")?.getAttribute("title"),
            };
          }
        );
      });
    } catch (error) {
      console.error("Failed to get latest tweets.");
    }
  }

  async checkNewTweets() {
    if (!this.page) return null;
    await this.page.reload({ waitUntil: "networkidle2" });
    const tweets = await this.getLatestTweets();
    if (!this.lastTweetId) return tweets;
    return tweets.filter((tweet) => tweet.id > this.lastTweetId);
  }

  async processTweets(tweets) {
    if (this.processing) {
      console.warn("WARNING: Still processing tweets.");
      return;
    }
    console.log("Processing new tweets, number:", tweets.length);
    for (const tweet of tweets) {
      await postToBinance(this.browser, tweet.text);
      this.lastTweetId = tweet.id;
    }
    this.processing = false;
  }
}

module.exports = TwitterMonitor;
