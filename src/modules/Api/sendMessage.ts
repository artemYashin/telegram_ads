import { RawApi } from "grammy";
import { Other } from "node_modules/grammy/out/core/api.js";
import { getBotInstance } from "../BotManager/Bot.js";
import { getBotInstance as getBotManagerInstance } from "../BotManager/BotsManager.js";
import { findUserByBotId } from "../UserState/UserState.js";

export default async function sendMessage(chatid: number, text: string, config?: Other<RawApi, "sendMessage", "text">, botid?: number) {
    let bot;

    if (!botid) {
        bot = getBotInstance();
    } else {
        const user = await findUserByBotId(botid); 
        bot = getBotManagerInstance(user.id, botid);
        if (!bot) {
            bot = getBotInstance();
        } else {
            bot = bot.instance;
        }
    }
    return bot.api.sendMessage(chatid, text, config);
}