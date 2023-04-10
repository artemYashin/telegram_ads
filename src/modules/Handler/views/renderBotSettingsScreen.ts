import { Bot as GrammyBot, InlineKeyboard } from "grammy";
import { sendMessageAuto } from "../../Api/sendMessageAuto.js";
import { CommandList } from "../states/commandList.js";
import { Bot, findUser, findUserByBotId } from "../../UserState/UserState.js";
import { getBotName } from "../../Api/getBotName.js";
import { LogTags, showError, showWarningError } from "../../Logging/ConsoleLog.js";
import { consts } from "../consts.js";
import { getBotInstance } from "../../BotManager/BotsManager.js";

interface RenderBotSettingsScreen { 
    text?: string;
    send?: boolean;
    chatid: number;
    botid: number;
    userid?: number;
}

function formatCommand(command: CommandList, botid: number) {
    return `${command}__${botid}`;
}

function getKeyboard(bot: Bot) {
    const keyboard = (new InlineKeyboard());
    keyboard.text('📑Текущий рекламный пост📑', formatCommand(CommandList.SHOW_POST, bot.id)).row()
        .text('📝Изменить рекламный пост📝', formatCommand(CommandList.CHANGE_POST, bot.id)).row()
        .text('📜Список получателей📜', formatCommand(CommandList.SHOW_RECIEVERS, bot.id)).row()
        .text('✉️Отправить пост✉️', formatCommand(CommandList.SEND_ARTICLE, bot.id)).row()
        .text('📅Изменить расписание📅', formatCommand(CommandList.SCHEDULE, bot.id)).row();
    if (bot.isActive) {
        keyboard.text('✅Отправка по расписанию✅', formatCommand(CommandList.DISABLE_SCHEDULE, bot.id)).row();
    } else {
        keyboard.text('❌Отправка по расписанию❌', formatCommand(CommandList.ENABLE_SCHEDULE, bot.id)).row();
    }
    keyboard.text(consts.back, CommandList.BOT_LIST).row()
            .text(consts.home, CommandList.CANCEL_STATE);
    return keyboard;
}

export async function renderBotSettingsScreen(params: RenderBotSettingsScreen) {
    return new Promise<void>(async (resolve) => {
        const user = await findUserByBotId(params.botid);
        const bot = user.bots.find((bot: Bot) => bot.id == params.botid);
        
        if (bot === undefined) {
            showWarningError('Failed to find bot');
            resolve();
            return;
        }

        let botObj = getBotInstance(user.id, bot.id)?.instance;
        
        if (botObj === undefined) {
            botObj = new GrammyBot(bot.token);
            showError('Failed to find bot while rendering settings');
        }

        if (botObj === undefined) {
            resolve();
            return;
        }

        const botName = (await botObj.api.getMe()).first_name;
        const text = `Настройка бота:\n*${botName}*`;
        const config: any = {
            reply_markup: await getKeyboard(bot),
            chatid: params.chatid,
            parse_mode: 'Markdown',
            text: params.text ? `${params.text}\n\n${text}` : text 
        };

        if (params.send) {
            config.send = params.send;
        }

        await sendMessageAuto(config).catch(() => false);

        resolve();
    });
}