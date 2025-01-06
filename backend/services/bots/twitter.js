import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";

dotenv.config();

class TwitterBotService {
  constructor() {
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_TOKEN_SECRET,
    });
  }

  extractTweetId(url) {
    // Handle both old and new Twitter URL formats
    const patterns = [
      /twitter\.com\/\w+\/status\/(\d+)/, // twitter.com
      /x\.com\/\w+\/status\/(\d+)/, // x.com
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    throw new Error("Invalid Twitter URL format");
  }

  async getTweetByUrl(url) {
    try {
      const tweetId = this.extractTweetId(url);
      return await this.getTweet(tweetId);
    } catch (error) {
      console.error("Error extracting tweet ID:", error);
      throw new Error(`Failed to fetch tweet: ${error.message}`);
    }
  }

  async getTweet(id) {
    return await this.client.v2.singleTweet(id, {
      expansions: [
        "author_id",
        "attachments.media_keys",
        "referenced_tweets.id",
      ],
      "tweet.fields": [
        "created_at",
        "text",
        "public_metrics",
        "entities",
        "attachments",
      ],
      "user.fields": ["name", "username", "profile_image_url"],
      "media.fields": ["url", "preview_image_url", "type"],
    });
  }
}

export default TwitterBotService;
