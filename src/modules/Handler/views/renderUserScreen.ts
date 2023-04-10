import { User, findUser } from "../../UserState/UserState.js";
import { InlineKeyboard } from "grammy";
import { CommandList } from "../states/commandList.js";
import { getUserName } from "../../Api/getUserName.js";
import { sendMessageAuto } from "../../Api/sendMessageAuto.js";
import { consts } from "../consts.js";

function formatCommand(command: CommandList, userid: number) {
    return `${command}__${userid}`;
}

function getKeyboard(user: User) {
    let result = new InlineKeyboard();

    if (!user.isEnabled) {
        result.text('❌Пользователь отключен❌', formatCommand(CommandList.ENABLE_USER, user.id)).row();;
    } else {
        result.text('✅Пользователь активен✅', formatCommand(CommandList.DISABLE_USER, user.id)).row();
    }

    result.text('📃Список ботов пользователя', formatCommand(CommandList.USER_BOT_LIST, user.id)).row();
    result.text(consts.back, CommandList.USERS_LIST).row();
    result.text(consts.home, CommandList.CANCEL_STATE);
    return result;
}

async function formatUserInfo(user: User) {
    return new Promise<string>(async (resolve) => {
        let result = `Информация о пользователе *${await getUserName(user.id, false).catch(() => undefined)}*:\n\n`;
        
        result += user.isEnabled ? "Активен: ✅" : "Активен: ❌";
        result += '\n';
        result += user.admin ? "Администратор: ✅" : 'Администратор: ❌';
        
        if (user.bots.length > 0) {
            result += '\n';
            result += `Количество ботов: *${user.bots.length}*`;
        }

        resolve(result);
    });
}

export async function renderUserScreen(chatid: number, userid: number) {
    const user = await findUser(userid);
    const text = await formatUserInfo(user);
    const keyboard = getKeyboard(user);

    await sendMessageAuto({
        chatid: chatid,
        reply_markup: keyboard,
        text: text,
        parse_mode: "Markdown",
    });
}