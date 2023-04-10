import { setTime } from "../../Timer/Timeset.js";
import { Bot, findUser, findUserByBotId, updateUserState } from "../../UserState/UserState.js";

export async function setBotTime(chatid: number, botid: number, day: number, time: number) {
    return new Promise<void>(async (resolve) => {
        const user = await findUserByBotId(botid);
        const bot = user.bots.find((bot: Bot) => bot.id == botid);
        
        if (bot) {
            bot.schedule = setTime(bot.schedule, day, time);
        }

        await updateUserState(user);
        resolve();
    });
}