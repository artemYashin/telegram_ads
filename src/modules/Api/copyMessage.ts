import { getBotInstance } from "../Bot/Bot.js";
import { showCriticalError, showWarningError } from "../Logging/ConsoleLog.js";

export default async function copyMessage(chatid: number, chatid_from: number, msgid_from: number) {
    return new Promise<void>(async (resolve, reject) => {
        try {
            const bot = getBotInstance();
            bot.api.copyMessage(chatid, chatid_from, msgid_from).then(() => {
                resolve();
            }).catch((err) => {
                reject();
            });
        } catch {
            showCriticalError('Unknown error while copying message');
            reject();
        }
    });
}