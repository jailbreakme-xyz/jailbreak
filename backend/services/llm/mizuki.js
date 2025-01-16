import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

class MizukiService {
  constructor() {
    this.baseUrl = process.env.MIZUKI_URL;
  }

  async sendMessage(message) {
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      },
    };

    const response = await axios.request(config);
    return parseResponse(response.data);
  }
}

function parseResponse(response) {
  let message = "";

  const entries =
    typeof response === "string"
      ? response.split("\n").map((line) => {
          const [key, value] = line.split(":");
          return [key.trim(), value];
        })
      : Object.entries(response);

  for (const [key, value] of entries) {
    if (key === "0") {
      const cleanValue =
        typeof value === "string" ? value.replace(/^"|"$/g, "") : value;
      message += cleanValue;
    }
  }

  return {
    message,
  };
}

export const mizukiService = new MizukiService();
