import { Bot as GrammyBot } from 'grammy';
import { Bot, findUser, getUsers } from '../UserState/UserState.js';
import { showNotice, showWarningError } from '../Logging/ConsoleLog.js';
import { addReciever, removeReciever } from '../Recievers/Recievers.js';

type BotInstance = {
    instance: GrammyBot;
    token: string;
    id: number;
}

const bots = new Map<any, BotInstance[]>();

export async function runBot(userid: number, botid: number) {
    return new Promise<void>(async (resolve, reject) => {
        const user = await findUser(userid);
        const bot = user.bots.find((bot) => bot.id == botid);
        
        if (bot === undefined) {
            reject(`Failed to initialize bot with id ${botid}`);
            return;
        }

        const botInstance = new GrammyBot(bot.token);
        const botResponse = await botInstance.api.getMe().catch(() => false);
        
        if (botResponse === false) {
            reject(`Failed to initialize bot with id ${botid}`);
            return;
        }
        
        initBot(botInstance, bot);
        addBotInstance(userid, bot, botInstance);

        showNotice(`Successfully loaded bot ${(botResponse as any).first_name}`);
        resolve();
    });
};

export async function initManager() {
    return new Promise<void> (async (resolve) => {
        const users = await getUsers();

        for (let i = 0; i < users.length; i++) {
            let userBots = users[i].bots;
            
            for (let j = 0; j < userBots.length; j++) {
                let bot = userBots[j];
                
                await runBot(users[i].id, bot.id).catch((err) => {
                    showWarningError(err);
                });
            }
        }

        resolve();
    });
}

export function getBotInstance(chatid: number, botid: number) {
    if (!bots.has(chatid)) {
        return undefined;
    }
    const botInstance = bots.get(chatid)?.find((bot) => bot.id == botid);
    return botInstance;
}

export async function checkUpdates() {
    return new Promise<void> (async (resolve) => {
        const users = await getUsers();
        
        for (let i = 0; i < users.length; i++) {
            let userBots = users[i].bots;
            
            for (let j = 0; j < userBots.length; j++) {
                let bot = userBots[j];
                
                if (bots.has(users[i].id)) {
                    const runningBots = bots.get(bots);
                    
                    if (runningBots == undefined || runningBots.find((el) => el.id == bot.id) === undefined) {
                        await runBot(users[i].id, bot.id).catch();
                    }
                }
            }
        }

        resolve();
    });
}

function initBot(instance: GrammyBot, bot: Bot) {
    instance.on("my_chat_member", async (ctx) => {
        const botId = ctx.me.id;
        showNotice('Handling member update')
        if (ctx.update.my_chat_member.chat.type == "channel") {
            showNotice('Handling channel')
            if ((ctx.update.my_chat_member.new_chat_member as any).can_post_messages == true) {
                showNotice('Adding new channel')
                await addReciever({chatid: ctx.update.my_chat_member.chat.id}, botId);
            } else {
                showNotice('Removing channel')
                await removeReciever({chatid: ctx.update.my_chat_member.chat.id}, botId);
            }
        } else {
            showNotice('Handling chat/group')
            if (ctx.update.my_chat_member.new_chat_member.status == "left" || ctx.update.my_chat_member.new_chat_member.status == "kicked") {
                showNotice('Removing chat/group')
                await removeReciever({chatid: ctx.update.my_chat_member.chat.id}, botId);
            } else {
                showNotice('Adding chat/group')
                await addReciever({chatid: ctx.update.my_chat_member.chat.id}, botId);
            }
        }
    });

    instance.start().catch(() => {
        showWarningError(`Bot with id ${bot.id} has crashed`);
    });
}

function addBotInstance(chatid: number, bot: Bot, grammybot: GrammyBot) {
    if (bots.has(chatid)) {
        const botList = bots.get(chatid);
        
        if (botList !== undefined) {
            botList.push({
                instance: grammybot,
                token: bot.token,
                id: bot.id
            });
            bots.set(chatid, botList);
        }
    } else {
        bots.set(chatid, [{
            instance: grammybot,
            token: bot.token,
            id: bot.id
        }]);
    }
}

function removeBotInstance(chatid: number, botid: number) {
    if (bots.has(chatid)) {
        const botList = bots.get(chatid);
        
        if (botList !== undefined) {
            botList.filter((bot: BotInstance) => {
                if (bot.id == botid) {
                    bot.instance.stop();
                    return false;
                }

                return true;
            });

            bots.set(chatid, botList);
        }
    }
}