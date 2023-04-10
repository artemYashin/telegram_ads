import { getData, setData } from "../Database/Database.js";
import { showCriticalError, showError } from "../Logging/ConsoleLog.js";
import { Bot, findUser, findUserByBotId, updateUserState } from "../UserState/UserState.js";

export type Reciever = {
    chatid: number;
}

export async function addReciever(reciever: Reciever, botid: number) {
    return new Promise<void>(async (resolve) => {
        const user = await findUserByBotId(botid).catch(() => undefined);
        
        if (user === undefined) {
            resolve();
            return;
        }

        user.bots.map((bot: Bot) => {
            if (bot.id == botid) {
                bot.recievers.push(reciever.chatid);
            }
            
            return bot;
        });

        await updateUserState(user);

        resolve();
    });
}

export async function removeReciever(reciever: Reciever, botid: number) {
    return new Promise<void>(async (resolve) => {
        const user = await findUserByBotId(botid).catch(() => undefined);
        
        if (user === undefined) {
            resolve();
            return;
        }

        user.bots.map((bot: Bot) => {
            if (bot.id == botid) {
                bot.recievers = bot.recievers.filter((rec: number) => {
                    if (reciever.chatid == rec) {
                        return false;
                    }

                    return true;
                });
            }
            
            return bot;
        });

        await updateUserState(user);

        resolve();
    });
}


export async function getRecievers(userid: number, botid: number): Promise<Reciever[]> {
    return new Promise<Reciever[]>(async (resolve) => {
        const user = await findUser(userid).catch(() => undefined);
        
        if (user === undefined) {
            resolve([]);
            return;
        }

        const bot = user.bots.find((bot) => {
            if (bot.id == botid) {
                return true;
            }

            return false;
        })

        if (bot === undefined) {
            resolve([]);
            return;
        }

        const result = bot.recievers.map<Reciever>((rec) => ({chatid: rec}))

        resolve(result);
    });
}