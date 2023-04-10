import { Bot } from 'grammy';
import { getBotInstance } from "../BotManager/Bot.js";
import { showCriticalError, showWarningError } from "../Logging/ConsoleLog.js";

export default async function copyMessage(chatid: number, chatid_from: number, msgid_from: number, botInstance?: Bot) {
    return new Promise<void>(async (resolve, reject) => {
        try {
            let bot: any = getBotInstance();

            if (botInstance) {
                bot = botInstance;
            }
            
            bot.api.copyMessage(chatid, chatid_from, msgid_from).then(() => {
                resolve();
            }).catch((err: any) => {
                reject(err);
            });
        } catch (err) {
            showCriticalError('Unknown error while copying message');
            reject(err);
        }
    });
}