import { getUserName } from "../Api/getUserName.js";
import { State, findUser, findUserByBotId, updateUserState } from "../UserState/UserState.js";
import { addNewBot } from "./commands/addNewBot.js";
import { changeBotPost } from "./commands/changeBotPost.js";
import { generatePassword } from "./commands/generatePassword.js";
import { renderPasswords } from "./commands/renderPasswords.js";
import { setBotTime } from "./commands/setBotTime.js";
import { showBotPost } from "./commands/showBotPost.js";
import { showRecievers } from "./commands/showRecievers.js";
import { askConfirmation } from "./states/askConfirmation.js";
import { cancelState } from "./states/cancelState.js";
import { CommandList } from "./states/commandList.js";
import { sendArticleToRecievers } from "./states/sendArticleToRecievers.js";
import { renderBotDayScheduleScreen } from "./views/renderBotDayScheduleScreen.js";
import { renderBotScheduleScreen } from "./views/renderBotScheduleScreen.js";
import { renderBotSettingsScreen } from "./views/renderBotSettingsScreen.js";
import { renderBotsScreen } from "./views/renderBotsScreen.js";
import { renderMainScreen } from "./views/renderMainScreen.js";
import { renderPasswordsScreen } from "./views/renderPasswordsScreen.js";
import { renderUserScreen } from "./views/renderUserScreen.js";
import { renderActiveUsersScreen, renderDisabledUsersScreen, renderUsersListScreen } from "./views/renderUsersListScreen.js";

export async function handleCommand(chatid: number, payload: string) {
    return new Promise<void>(async (resolve) => {
        const user = await findUser(chatid);

        if (!user.isEnabled) {
            resolve();
            return;
        }

        // Cancelling state
        if (payload === CommandList.CANCEL_STATE) {
            const prevState = user.state;
            const prevStateFor = user.state_for;
            await cancelState(chatid);
            if (prevState == State.WAITING_FOR_MSG && prevStateFor !== false) {
                await renderBotSettingsScreen({
                    chatid: user.id,
                    botid: Number(prevStateFor.split('__')[1])
                })
            } else {
                await renderMainScreen({
                    chatid: chatid,
                    admin: user.admin
                });
            }
            resolve();
            return;
        }

        // Ignoring when waiting for something
        if (user.state == State.WAITING_FOR_MSG || user.state == State.WAITING_FOR_TOKEN) {
            resolve();
            return;
        }

        switch(payload as CommandList) {
            case CommandList.GENERATE_PASSWORD:
                await generatePassword(chatid);
                break;
            case CommandList.PASSWORDS_LIST:
                await renderPasswordsScreen({
                    chatid: chatid,
                });
                return;
                break;
            case CommandList.RENDER_PASSWORDS:
                await renderPasswords(chatid);
                break;
            case CommandList.BOT_LIST:
                await renderBotsScreen({chatid: chatid});
                break;
            case CommandList.ADD_NEW_BOT:
                await addNewBot(chatid);
                break;
            case CommandList.USERS_LIST:
                await renderUsersListScreen(chatid);
                break;
            case CommandList.RENDER_ACTIVE_USERS:
                await renderActiveUsersScreen(chatid);
                break;
            case CommandList.RENDER_DISABLED_USERS:
                await renderDisabledUsersScreen(chatid);
                break;
            default:
                break;
        }

        if (payload.startsWith(CommandList.USER_BOT_LIST)) {
            const [,userid] = payload.split('__');
            await renderBotsScreen({
                chatid: chatid,
                userid: Number(userid),
                text: `Список ботов пользователя ${await getUserName(Number(userid), false).catch(() => undefined)}`
            });
            resolve();
                return;
        }

        if (payload.startsWith(CommandList.OPEN_USER)) {
            const [,userid] = payload.split('__');
            await renderUserScreen(chatid, Number(userid));
            resolve();
                return;
        }

        if (payload.startsWith(CommandList.USER_ADD_BOT)) {
            const [, userid] = payload.split('__');
            await addNewBot(chatid, Number(userid));
            resolve();
                return;
        }

        if (payload.startsWith(CommandList.USER_OPEN_BOT)) {
            const [botid, userid] = payload.split('__')[1].split('-');
            await renderBotSettingsScreen({
                chatid: chatid,
                userid: Number(userid),
                botid: Number(botid),
                text: `Настройка бота пользователя ${await getUserName(Number(userid), false).catch(() => undefined)}`
            })
            resolve();
            return;
        }

        if (payload.startsWith(CommandList.ENABLE_USER)) {
            const [,userid] = payload.split('__');
            const user = await findUser(Number(userid));
            user.isEnabled = true;
            await updateUserState(user);
            await renderUserScreen(chatid, Number(userid));
            resolve();
                return;
        }

        if (payload.startsWith(CommandList.DISABLE_USER)) {
            const [,userid] = payload.split('__');
            const user = await findUser(Number(userid));
            user.isEnabled = false;
            await updateUserState(user);
            await renderUserScreen(chatid, Number(userid));
            resolve();
                return;
        }

        if (payload.startsWith(CommandList.OPEN_BOT)) {
            const botid = payload.split('__')[1];
            await renderBotSettingsScreen({
                chatid: chatid,
                botid: Number(botid)
            });
            resolve();
                return;
        }

        if (payload.startsWith(CommandList.SHOW_POST)) {
            const botid = payload.split('__')[1];
            await showBotPost(chatid, Number(botid));
            resolve();
                return;
        }

        if (payload.startsWith(CommandList.CHANGE_POST)) {
            const botid = payload.split('__')[1];
            await changeBotPost(chatid, Number(botid));
            resolve();
                return;
        }

        if (payload.startsWith(CommandList.SHOW_RECIEVERS)) {
            const botid = payload.split('__')[1];
            await showRecievers(chatid, Number(botid));
            resolve();
                return;
        }
        
        if (payload.startsWith(CommandList.SEND_ARTICLE)) {
            const botid = payload.split('__')[1];
            await askConfirmation(chatid, `${CommandList.SEND_ARTICLE_CONFIRM}__${botid}`);
            resolve();
                return;
        }

        if (payload.startsWith(CommandList.SCHEDULE)) {
            const botid = payload.split('__')[1];
            await renderBotScheduleScreen({
                botid: Number(botid),
                chatid: chatid
            });
            resolve();
                return;
        }

        if (payload.startsWith(CommandList.RENDER_DAY)) {
            const [botid, day] = payload.split('__')[1].split('-');
            await renderBotDayScheduleScreen({
                botid: Number(botid),
                chatid: chatid,
                day: Number(day)
            });
            resolve();
                return;
        }

        if (payload.startsWith(CommandList.SET_DAY_TIME)) {
            const [botid, day, time] = payload.split('__')[1].split('-');
            await setBotTime(chatid, Number(botid), Number(day), Number(time));
            await renderBotDayScheduleScreen({
                chatid: chatid,
                botid: Number(botid),
                day: Number(day)
            })
            resolve();
                return;
        }

        if (payload.startsWith(CommandList.ENABLE_SCHEDULE)) {
            const botid = payload.split('__')[1];
            const targetUser = await findUserByBotId(Number(botid));
            targetUser.bots = targetUser.bots.map((bot) => {
                if (bot.id == Number(botid)) {
                    bot.isActive = true;
                }
                return bot;
            });
            await updateUserState(targetUser);
            await renderBotSettingsScreen({
                chatid: chatid,
                botid: Number(botid),
                text: '✅Отправка постов по расписанию включена!'
            });
            resolve();
                return;
        }

        if (payload.startsWith(CommandList.DISABLE_SCHEDULE)) {
            const botid = payload.split('__')[1];
            const targetUser = await findUserByBotId(Number(botid));
            targetUser.bots = targetUser.bots.map((bot) => {
                if (bot.id == Number(botid)) {
                    bot.isActive = false;
                }
                return bot;
            });
            await updateUserState(targetUser);
            await renderBotSettingsScreen({
                chatid: chatid,
                botid: Number(botid),
                text: '❌Отправка постов по расписанию выключена!'
            });
            resolve();
                return;
        }

        if (payload.startsWith(CommandList.SEND_ARTICLE_CONFIRM)) {
            const botid = payload.split('__')[1];
            await sendArticleToRecievers(Number(botid));
            await renderBotSettingsScreen({
                chatid: chatid,
                botid: Number(botid),
                text: 'Пост успешно отправлен!'
            });
            resolve();
                return;
        }

        resolve();
    });
}