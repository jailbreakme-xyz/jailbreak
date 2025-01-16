import axios from "axios";

// Create axios instance with dynamic base URL
const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://eliza:3030"
      : "https://jailbreakme.xyz",
});

class ElizaService {
  constructor() {
    this.baseUrl = "/eliza"; // since we're connecting directly to the eliza service
    this.apiKey = process.env.JAILBREAK_ELIZA_API;
  }

  // Common headers for all requests
  #getHeaders() {
    return {
      "Content-Type": "application/json",
      "jailbreak-api-key": this.apiKey,
    };
  }

  // Get all available agents
  async getAgents() {
    try {
      const response = await api.get("/agents", {
        headers: this.#getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching Eliza agents:", error.message);
      throw error;
    }
  }

  // Send message to specific agent
  async sendMessage(agentId, text, userId) {
    try {
      const payload = {
        text,
        userId,
        roomId: `default-room-${userId}`,
      };

      const response = await api.post(`/${agentId}/message`, payload, {
        headers: this.#getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error sending message to Eliza:", error.message);
      throw error;
    }
  }
}

// Export singleton instance
export const elizaService = new ElizaService();
