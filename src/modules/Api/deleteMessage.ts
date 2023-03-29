import { getBotInstance } from "../Bot/Bot.js";

export default async function deleteMessage(chatid: number, msgid: number) {
    const bot = getBotInstance();
    return bot.api.deleteMessage(chatid, msgid);
}