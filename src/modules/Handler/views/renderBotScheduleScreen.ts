import { Bot as GrammyBot, InlineKeyboard } from "grammy";
import { sendMessageAuto } from "../../Api/sendMessageAuto.js";
import { CommandList } from "../states/commandList.js";
import { Bot, findUser, findUserByBotId } from "../../UserState/UserState.js";
import { showWarningError } from "../../Logging/ConsoleLog.js";
import { Schedule } from "../../Timer/Timeset.js";
import { consts } from "../consts.js";

interface RenderBotScheduleScreen { 
    send?: boolean;
    chatid: number;
    botid: number;
}

const enabledEmoji = '✅';
const disabledEmoji = '❌';

const weekDays = [
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
    'Воскресенье',
]

function formatCurrentSchedule(schedule: Schedule) {
    Object.keys(schedule).map((key: string) => {
        schedule[Number(key)] = (Object.values(schedule[Number(key)]) as Array<number>).sort((a: number, b: number) => a > b ? 1 : -1);
    });
    return (Object.keys(schedule).map((key: string) => {
        if (schedule[Number(key)].length <= 0) return false;
        return `*📅${weekDays[Number(key)]}*:\n-------------------\n${schedule[Number(key)].map((time: number) => {
            return `${time.toString().length > 1 ? time : '0' + time}:00`
        }).join('\n')}`;
    }).filter((el) => el !== false).join('\n\n'));
}

function formatCommand(command: CommandList, botid: number, day: number) {
    return `${command}__${botid}-${day}`;
}

function formatCommand2(command: CommandList, botid: number) {
    return `${command}__${botid}`;
}

export function renderWeekDaysKeyboard(bot: Bot) {
    const keyboard = new InlineKeyboard();
    
    for (let i = 0; i < weekDays.length; i++) {
        if ((i % 2 == 0 && i > 0)) {
            keyboard.row();
        }
        keyboard.text(`📅${weekDays[i]}`, formatCommand(CommandList.RENDER_DAY, bot.id, i));
        if (i == weekDays.length - 1) {
            keyboard.row();
        }
    }
    keyboard.text(consts.back, formatCommand2(CommandList.OPEN_BOT, bot.id)).row();
    keyboard.text(consts.home, CommandList.CANCEL_STATE);
    return keyboard;
}

export async function renderBotScheduleScreen(params: RenderBotScheduleScreen) {
    return new Promise<void>(async (resolve) => {
        const user = await findUserByBotId(params.botid)
        const bot = user.bots.find((bot: Bot) => bot.id == params.botid);
        
        if (bot === undefined) {
            showWarningError('Failed to find bot');
            resolve();
            return;
        }
        
        let schedule = formatCurrentSchedule(bot.schedule);
        if (schedule.trim() === '') {
            schedule = 'Расписание не установлено';
        }
        const config: any = {
            reply_markup: renderWeekDaysKeyboard(bot),
            chatid: params.chatid,
            parse_mode: 'Markdown',
            text: schedule
        };

        if (params.send) {
            config.send = params.send;
        }

        await sendMessageAuto(config).catch(() => false);

        resolve();
    });
}