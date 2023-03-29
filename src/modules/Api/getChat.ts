import { getBotInstance } from "../Bot/Bot.js"

export function getChat(chatid: number) {
    const bot = getBotInstance();
    return bot.api.getChat(chatid);
}