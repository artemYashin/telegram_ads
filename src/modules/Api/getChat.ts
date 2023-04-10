import { getBotInstance } from "../BotManager/Bot.js"

export function getChat(chatid: number) {
    const bot = getBotInstance();
    return bot.api.getChat(chatid);
}