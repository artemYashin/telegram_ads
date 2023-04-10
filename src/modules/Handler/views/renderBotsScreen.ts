import { InlineKeyboard } from "grammy";
import { sendMessageAuto } from "../../Api/sendMessageAuto.js";
import { CommandList } from "../states/commandList.js";
import { Bot, findUser } from "../../UserState/UserState.js";
import { getBotName } from "../../Api/getBotName.js";
import { consts } from "../consts.js";

interface RenderBotsScreen { 
    text?: string;
    send?: boolean;
    chatid: number;
    userid?: number;
}

function formatCommand(command: CommandList, userid: number | string) {
    return `${command}__${userid}`;
}

async function getKeyboard(bots: Bot[], params: RenderBotsScreen) {
    return new Promise<InlineKeyboard>(async (resolve) => {
        const keyboard = new InlineKeyboard();
        
        if (!params.userid) {
            keyboard.text('➕Добавить нового бота', CommandList.ADD_NEW_BOT).row();
        } else {
            keyboard.text('➕Добавить нового бота', formatCommand(CommandList.USER_ADD_BOT, params.userid)).row();
        }
        
        let i = 1;

        if (bots.length > 0) {
            for (let bot of bots) {
                const botName = await getBotName(bot.token);
                keyboard.text(`${i}: 🤖${botName}🤖`, params.userid ? `${CommandList.USER_OPEN_BOT}__${bot.id}-${params.userid}` : formatCommand(CommandList.OPEN_BOT, bot.id)).row();
                i++;
            }
        }

        keyboard.text(consts.home, CommandList.CANCEL_STATE);

        resolve(keyboard);
    });
}

export async function renderBotsScreen(params: RenderBotsScreen) {
    return new Promise<void>(async (resolve) => {
        let user;
        if (!params.userid) {
            user = await findUser(params.chatid)
        } else {
            user = await findUser(params.userid);
        }
        const keyboard = await getKeyboard(user.bots, params);
        
        const config: any = {
            reply_markup: keyboard,
            chatid: params.chatid,
            text: params.text ?? 'Выберите пункт меню'
        };

        if (params.send) {
            config.send = params.send;
        }

        await sendMessageAuto(config).catch(() => false);

        resolve();
    });
}