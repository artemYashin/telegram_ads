import { Bot as GrammyBot, InlineKeyboard } from "grammy";
import { sendMessageAuto } from "../../Api/sendMessageAuto.js";
import { CommandList } from "../states/commandList.js";
import { Bot, findUser, findUserByBotId } from "../../UserState/UserState.js";
import { showWarningError } from "../../Logging/ConsoleLog.js";
import { Schedule } from "../../Timer/Timeset.js";
import { consts } from "../consts.js";

interface RenderBotDayScheduleScreen { 
    send?: boolean;
    chatid: number;
    botid: number;
    day: number;
}

const enabledEmoji = '🕐';
const disabledEmoji = '⭕';

const weekDays = [
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
    'Воскресенье',
]

function formatCommand3(command: CommandList, botid: number, day: number, time: number) {
    return `${command}__${botid}-${day}-${time}`;
}

function formatCommand2(command: CommandList, botid: number) {
    return `${command}__${botid}`;
}

export function renderTimeKeyboard(schedule: Schedule, day: number, botid: number) {
    const keyboard = new InlineKeyboard();
    const availableTime = schedule[day];

    for (let i = 0; i <= 23; i++) {
        let emoji;
        if (availableTime && availableTime.includes(i)) {
            emoji = enabledEmoji;
        } else {
            emoji = disabledEmoji;
        }
        if (i > 0 && i % 4 == 0) {
            keyboard.row();
        }
        keyboard.text(`${emoji}${i}:00${emoji}`, formatCommand3(CommandList.SET_DAY_TIME, botid, day, i));
    }

    keyboard.row().text(consts.back, formatCommand2(CommandList.SCHEDULE, botid));
    keyboard.row().text(consts.home, CommandList.CANCEL_STATE);
    return keyboard;
}

export async function renderBotDayScheduleScreen(params: RenderBotDayScheduleScreen) {
    return new Promise<void>(async (resolve) => {
        const user = await findUserByBotId(params.botid)
        const bot = user.bots.find((bot: Bot) => bot.id == params.botid);
        
        if (bot === undefined) {
            showWarningError('Failed to find bot');
            resolve();
            return;
        }

        const config: any = {
            reply_markup: renderTimeKeyboard(bot.schedule, params.day, bot.id),
            chatid: params.chatid,
            parse_mode: 'Markdown',
            text: `Редактирование расписания на: \n\n*${weekDays[params.day]}*`
        };

        if (params.send) {
            config.send = params.send;
        }

        await sendMessageAuto(config).catch(() => false);

        resolve();
    });
}