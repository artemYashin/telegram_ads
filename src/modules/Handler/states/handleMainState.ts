import { InlineKeyboard } from "grammy";
import { Article, getArticle } from "../../Article/Article.js";
import sendMessage from "../../Api/sendMessage.js";
import { changeStateField, getUserState, State, UserState } from "../../UserState/UserState.js";
import { CommandList } from "./commandList.js";
import { updateMessageId } from "./updateMessageId.js";
import editMessage from "../../Api/editMessage.js";
import copyMessage from "../../Api/copyMessage.js";
import { deleteLastButtons } from "./deleteLastButtons.js";
import { getRecievers, removeReciever } from "../../Recievers/Recievers.js";
import { getChat } from "../../Api/getChat.js";
import { sendArticleToRecievers } from "./sendArticleToRecievers.js";
import { LogTags, showCriticalError, showError, showNotice, showWarningError } from "../../Logging/ConsoleLog.js";
import { getDayTimes, getTimes, setTime } from "../../Timer/Timeset.js";

const keyboard = (new InlineKeyboard())
.text('📑Текущий рекламный пост📑', CommandList.SHOW_POST).row()
.text('📝Изменить рекламный пост📝', CommandList.CHANGE_POST).row()
.text('📜Список получателей📜', CommandList.SHOW_RECIEVERS).row()
.text('✉️Отправить пост✉️', CommandList.SEND_ARTICLE).row()
.text('📅Изменить расписание📅', CommandList.SCHEDULE);

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

function getConfirmKeyboard(callback: CommandList) {
    return (new InlineKeyboard()).text('✅Подтвердить✅', callback).text('❌Отменить❌', CommandList.CANCEL_STATE);
}

async function formatCurrentSchedule() {
    return new Promise<string>(async (resolve) => {
        let availableTime = await getTimes();
        Object.keys(availableTime).map((key: string) => {
            availableTime[Number(key)] = (Object.values(availableTime[Number(key)]) as Array<number>).sort((a: number, b: number) => a > b ? 1 : -1);
        });
        resolve(Object.keys(availableTime).map((key: string) => {
            if (availableTime[Number(key)].length <= 0) return false;
            return `*${weekDays[Number(key)]}*:\n-------------------\n${availableTime[Number(key)].map((time: number) => {
                return `${time.toString().length > 1 ? time : '0' + time}:00`
            }).join('\n')}`;
        }).filter((el) => el !== false).join('\n\n'));
    });
}

export async function renderTimeKeyboard(day: string) {
    return new Promise<InlineKeyboard>(async (resolve) => {
        const keyboard = new InlineKeyboard();
        const availableTime = await getDayTimes(Number(day));
        for (let i = 0; i <= 23; i++) {
            let emoji;
            if (availableTime.includes(i)) {
                emoji = enabledEmoji;
            } else {
                emoji = disabledEmoji;
            }
            if (i > 0 && i % 4 == 0) {
                keyboard.row();
            }
            keyboard.text(`${emoji}${i}:00${emoji}`, `set-time-${day}-${i}`);
        }
        keyboard.row().text('Назад', CommandList.SCHEDULE);
        keyboard.row().text(`Главное меню`, CommandList.CANCEL_STATE);
        resolve(keyboard);
        return;
    });
}

export function renderWeekDaysKeyboard() {
    const keyboard = new InlineKeyboard();
    keyboard
    .text('Понедельник', 'render-time-0').text('Вторник', 'render-time-1').row()
    .text('Среда', 'render-time-2').text('Четверг', 'render-time-3').row()
    .text('Пятница', 'render-time-4').text('Суббота', 'render-time-5').row()
    .text('Воскресенье', 'render-time-6').row()
    .text(`Главное меню`, CommandList.CANCEL_STATE);
    return keyboard;
}

export async function askConfirmation(chatid: number, text: string = "Подтвердите действие", callback: CommandList) {
    const msgId = (await getUserState(chatid)).messageId;
    return new Promise<void>(async (resolve) => {
        await editMessage(chatid, msgId, text, {
            reply_markup: getConfirmKeyboard(callback)
        }).catch((err) => {
            showNotice('Failed to ask confirmation')
            showError(err);
        })
        resolve();
    });
}

export async function renderMainScreen(chatid: number, send: boolean = false, msg: string = "Выберите пункт меню") {

    return new Promise<void>(async (resolve) => {
        const msgId = (await getUserState(chatid)).messageId;
        if (msgId && !send) {
            let newMsgId = await editMessage(chatid, msgId, msg, {
                reply_markup: keyboard,
                chat_id: chatid
            }).catch((err) => {
                showNotice('Failed to edit message (renderMainScreen)')
                showError(err);
            });
            if (newMsgId) {
                await updateMessageId(chatid, (newMsgId as any).message_id);
            }
        } else {
            let newMsgId = await sendMessage(chatid, 'Выберите пункт меню.', {
                reply_markup: keyboard,
                chat_id: chatid
            }).catch((err) => {
                showNotice('Failed to send message (renderMainScreen)');
                showError(err);
            });
            await deleteLastButtons(chatid);
            if (newMsgId) {
                await updateMessageId(chatid, (newMsgId as any).message_id);
            }
        }
        resolve();
    });
}

export async function showCurrentPost(chatid: number) {
    return new Promise<void>(async (resolve) => {
        const article = (await getArticle());
        const msgId = (await getUserState(chatid)).messageId;
        if (article === false) {
            await renderMainScreen(chatid, false, 'Рекламный пост не установлен.');
            resolve();
            return;
        } else {
            try {
                await copyMessage(chatid, article.chatid, article.msgid);
            } catch {
                await renderMainScreen(chatid, false, 'Рекламный пост был удален.');
                resolve();
                return;
            }
        }
        await renderMainScreen(chatid, true);
        resolve();
    });
}

export async function showRecievers(chatid: number) {
    return new Promise<void>(async (resolve) => {
        let msgText;
        const msgId = (await getUserState(chatid)).messageId;
        const recievers = await getRecievers();
        if (recievers.length > 0) {
            const promises = recievers.map(({chatid}) => {
                return (getChat(chatid) as any).catch((err: any) => {
                    if (err.error_code == 403) {
                        showWarningError('Failed to get information about chat ' + chatid)
                        removeReciever({chatid: err.payload.chat_id});
                    }
                    return {deleted: true}
                });
            });

            const res: any = [];

            await Promise.all(promises).then((result) => {
                result.forEach((elem, i) => {
                    if (elem.deleted == true) return;
                    res.push(`*${i + 1}*) *${elem.title}* _:${Math.abs(elem.id)}_`);
                });
            });

            if (res.length > 0) {
                msgText = res.join('\n');
            } else {
                msgText = 'Получателей нет';
            }
        } else {
            msgText = "Получателей нет";
        }
        if (msgId && msgId > 0) {
            await editMessage(chatid, msgId, msgText, {
                parse_mode: "Markdown",
                reply_markup: keyboard
            }).catch((err) => {
                showNotice('Failed to show recipients (editMessage)', LogTags.ERROR)
                showError(err, LogTags.ERROR)
            });
        } else {
            await sendMessage(chatid, msgText, {
                parse_mode: "Markdown",
                chat_id: chatid,
                reply_markup: keyboard
            });
        }

        resolve();
    });
}

export async function waitForPost(chatid: number) {
    return new Promise<void>(async (resolve) => {
        const msgId = (await getUserState(chatid)).messageId;
        const newMsgId = await editMessage(chatid, msgId, 'Отправьте мне сообщение которое будет использовано в качестве рекламного поста.', {
            reply_markup: (new InlineKeyboard)
            .text('Отменить', CommandList.CANCEL_STATE),
            chat_id: chatid
        });
        await updateMessageId(chatid, (newMsgId as any).message_id);
        await changeStateField(chatid, { state: State.WAITING_FOR_MSG });
        resolve();
    });
}

export async function handleMainState(state: UserState, chatid: number, command?: CommandList, msgid?: number) {
    return new Promise<void>(async (resolve) => {
        if (!command) {
            await renderMainScreen(chatid);
            resolve();
            return;
        }
        
        if (command.startsWith('set-time')) {
            try {
                let [,,day,time] = command.split('-');
                await setTime(Number(day), Number(time));
                const msgId = (await getUserState(chatid)).messageId;
                await editMessage(chatid, msgId, 'Редактирование расписания на ' + weekDays[Number(command.split('-')[2])], {
                    reply_markup: await renderTimeKeyboard(command.split('-')[2].toString()),
                    chat_id: chatid
                }).catch((err) => { showWarningError('[Render time keyboard]' + err) });
                resolve();
                return;
            } catch {
                resolve();
                return;
            }
        }

        if (command.startsWith('render-time')) {
            const msgId = (await getUserState(chatid)).messageId;
            await editMessage(chatid, msgId, 'Редактирование расписания на ' + weekDays[Number(command.split('-')[2])], {
                reply_markup: await renderTimeKeyboard(command.split('-')[2].toString()),
                chat_id: chatid
            }).catch((err) => { showWarningError('[Render time keyboard]' + err) });
            resolve();
            return;
        }

        switch (command) {
            case CommandList.SHOW_POST:
                await showCurrentPost(chatid);
                break;
            case CommandList.CHANGE_POST:
                await waitForPost(chatid);
                break;
            case CommandList.SHOW_RECIEVERS:
                await showRecievers(chatid);
                break;
            case CommandList.SEND_ARTICLE:
                await askConfirmation(chatid, 'Подтвердить отправку поста?', CommandList.SEND_ARTICLE_CONFIRMED);
                break;
            case CommandList.SEND_ARTICLE_CONFIRMED:
                await sendArticleToRecievers();
                await renderMainScreen(chatid, false, "Пост успешно отправлен!");
                break;
            case CommandList.SCHEDULE:
                const msgId = (await getUserState(chatid)).messageId;
                let schedule = await formatCurrentSchedule();
                if (schedule.trim() === '') {
                    schedule = 'Расписание не установлено';
                }
                await editMessage(chatid, msgId, schedule, {
                    reply_markup: renderWeekDaysKeyboard(),
                    parse_mode: 'Markdown',
                    chat_id: chatid
                }).catch((err) => {showWarningError(err)})
            default:
                break;
        }
        resolve();
    });
}