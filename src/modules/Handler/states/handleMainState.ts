import { InlineKeyboard } from "grammy";
// import { Article, getArticle } from "../../Article/Article.js";
import sendMessage from "../../Api/sendMessage.js";
import { CommandList } from "./commandList.js";
import { updateMessageId } from "./updateMessageId.js";
import editMessage from "../../Api/editMessage.js";
import copyMessage from "../../Api/copyMessage.js";
import { deleteLastButtons } from "./deleteLastButtons.js";
import { getRecievers, removeReciever } from "../../Recievers/Recievers.js";
import { getChat } from "../../Api/getChat.js";
// import { sendArticleToRecievers } from "./sendArticleToRecievers.js";
import { LogTags, showCriticalError, showError, showNotice, showWarningError } from "../../Logging/ConsoleLog.js";
import { State, User, findUser, updateUserState } from "../../UserState/UserState.js";

// export async function handleMainState(state: User, chatid: number, command?: CommandList, msgid?: number) {
//     return new Promise<void>(async (resolve) => {
//         if (!command) {
//             await renderMainScreen(chatid);
//             resolve();
//             return;
//         }
        
//         if (command.startsWith('set-time')) {
//             try {
//                 let [,,day,time] = command.split('-');
//                 await setTime(Number(day), Number(time));
//                 const msgId = (await findUser(chatid)).messageId;
//                 await editMessage(chatid, msgId, 'Редактирование расписания на ' + weekDays[Number(command.split('-')[2])], {
//                     reply_markup: await renderTimeKeyboard(command.split('-')[2].toString()),
//                     chat_id: chatid
//                 }).catch((err) => { showWarningError('[Render time keyboard]' + err) });
//                 resolve();
//                 return;
//             } catch {
//                 resolve();
//                 return;
//             }
//         }

//         if (command.startsWith('render-time')) {
//             const msgId = (await findUser(chatid)).messageId;
//             await editMessage(chatid, msgId, 'Редактирование расписания на ' + weekDays[Number(command.split('-')[2])], {
//                 reply_markup: await renderTimeKeyboard(command.split('-')[2].toString()),
//                 chat_id: chatid
//             }).catch((err) => { showWarningError('[Render time keyboard]' + err) });
//             resolve();
//             return;
//         }

//         switch (command) {
//             case CommandList.SHOW_POST:
//                 await showCurrentPost(chatid);
//                 break;
//             case CommandList.CHANGE_POST:
//                 await waitForPost(chatid);
//                 break;
//             case CommandList.SHOW_RECIEVERS:
//                 await showRecievers(chatid);
//                 break;
//             case CommandList.SEND_ARTICLE:
//                 await askConfirmation(chatid, 'Подтвердить отправку поста?', CommandList.SEND_ARTICLE_CONFIRMED);
//                 break;
//             case CommandList.SEND_ARTICLE_CONFIRMED:
//                 await sendArticleToRecievers();
//                 await renderMainScreen(chatid, false, "Пост успешно отправлен!");
//                 break;
//             case CommandList.SCHEDULE:
//                 const msgId = (await findUser(chatid)).messageId;
//                 let schedule = await formatCurrentSchedule();
//                 if (schedule.trim() === '') {
//                     schedule = 'Расписание не установлено';
//                 }
//                 await editMessage(chatid, msgId, schedule, {
//                     reply_markup: renderWeekDaysKeyboard(),
//                     parse_mode: 'Markdown',
//                     chat_id: chatid
//                 }).catch((err) => {showWarningError(err)})
//             default:
//                 break;
//         }
//         resolve();
//     });
// }