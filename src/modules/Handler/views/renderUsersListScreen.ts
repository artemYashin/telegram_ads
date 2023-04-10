import { sendMessageAuto } from "../../Api/sendMessageAuto.js";
import { CommandList } from "../states/commandList.js";
import { InlineKeyboard } from "grammy";
import { showError } from "../../Logging/ConsoleLog.js";
import { User, getUsers } from "../../UserState/UserState.js";
import { getUserName } from "../../Api/getUserName.js";
import { consts } from "../consts.js";

export async function renderUsersListScreen(chatid: number) {
    await sendMessageAuto({
        chatid: chatid,
        reply_markup: (new InlineKeyboard())
        .text('✅Активные пользователи✅', CommandList.RENDER_ACTIVE_USERS).row()
        .text('❌Отключенные пользователи❌', CommandList.RENDER_DISABLED_USERS).row()
        .text(consts.home, CommandList.CANCEL_STATE),
        text: 'Выберите пункт меню'
    }).catch((err) => showError(err));
}

function filterUsersByActive(users: User[], status: boolean) {
    return users.filter((user) => user.isEnabled == status);
}

function formatUserCommand(command: CommandList, userid: number){
    return `${command}__${userid}`;
}

async function renderUsersKeyboard(users: User[]) {
    return new Promise<InlineKeyboard>(async (resolve) => {
        let result = new InlineKeyboard();
        for (let i = 0; i < users.length; i++) {
            if (i % 2 == 0 && i > 0){
                result.row();
            }
            
            result.text(`👤${await getUserName(users[i].id, false)}👤`, formatUserCommand(CommandList.OPEN_USER, users[i].id));
            
            if (i == users.length - 1) {
                result.row();
            }
        }
        result.text(consts.back, CommandList.USERS_LIST).row();
        result.text(consts.home, CommandList.CANCEL_STATE).row();
        resolve(result);
    });
}

export async function renderActiveUsersScreen(chatid: number) {
    let users = filterUsersByActive(await getUsers(), true);
    users = users.filter((user) => user.id != chatid);
    const keyboard = await renderUsersKeyboard(users);
    await sendMessageAuto({
        chatid: chatid,
        text: 'Список активных пользователей',
        reply_markup: keyboard
    })
}

export async function renderDisabledUsersScreen(chatid: number) {
    let users = filterUsersByActive(await getUsers(), false);
    users = users.filter((user) => user.id != chatid);
    const keyboard = await renderUsersKeyboard(users);
    await sendMessageAuto({
        chatid: chatid,
        text: 'Список отключенных пользователей',
        reply_markup: keyboard
    })
}