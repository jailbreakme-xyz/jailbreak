import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

class TelegramBotService {
  constructor() {
    this.token = process.env.ZYNX_TELEGRAM_TOKEN;
    this.chatId = process.env.TELEGRAM_CHAT_ID;
    this.bot = new TelegramBot(this.token, { polling: false });
  }

  async sendMessageToGroup(message) {
    try {
      await this.bot.sendMessage(this.chatId, message);
    } catch (error) {
      console.error("Telegram Bot Service Error:", error);
      throw error;
    }
  }
}

export default new TelegramBotService();
