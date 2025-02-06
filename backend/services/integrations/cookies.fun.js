import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

class CookiesFunService {
  constructor() {
    this.apiKey = process.env.COOKIEDOTFUN_API_KEY;
  }

  async getTweets(
    query,
    from = new Date().toISOString() - 1000 * 60 * 60 * 24 * 2,
    to = new Date().toISOString()
  ) {
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://api.cookie.fun/v1/hackathon/search/${query}?from=${from}&to=${to}`,
      headers: {
        "x-api-key": this.apiKey,
      },
    };

    const response = await axios.request(config);
    return response.data;
  }
}

export default new CookiesFunService();
