import { RawApi } from "grammy";
import { Other } from "node_modules/grammy/out/core/api.js";
import { getBotInstance } from "../Bot/Bot.js";

export default async function editMessage(chatid: number, msgId: number, text: string, config?: Other<RawApi, "editMessageText", "text">) {
    const bot = getBotInstance();
    return bot.api.editMessageText(chatid, msgId, text, config);
}