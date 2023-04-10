import { getBotInstance } from "../BotManager/Bot.js";

export async function getUserName(chatid: number, first_name_only: boolean = true) {
    return new Promise<string>(async (resolve) => {
        const bot = getBotInstance();
        const result = await bot.api.getChat(chatid);
        
        if (result.type == "private") {
            if (first_name_only || result.last_name == undefined) {
                resolve(result.first_name);
            } else {
                resolve(result.first_name + ' ' + result.last_name);
            }
            return;
        }

        resolve('Неизвестный бот');
    });
}