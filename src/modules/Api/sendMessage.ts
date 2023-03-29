import { RawApi } from "grammy";
import { Other } from "node_modules/grammy/out/core/api.js";
import { getBotInstance } from "../Bot/Bot.js";

export default async function sendMessage(chatid: number, text: string, config?: Other<RawApi, "sendMessage", "text">) {
    const bot = getBotInstance();
    return bot.api.sendMessage(chatid, text, config);
}