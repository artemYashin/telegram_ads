import { InlineKeyboard } from "grammy";
import { sendMessageAuto } from "../../Api/sendMessageAuto.js";
import { CommandList } from "../states/commandList.js";

interface RenderMainScreenProps { 
    text?: string;
    send?: boolean;
    chatid: number;
    admin: boolean;
}

function getKeyboard(admin: boolean) {
    if (admin) {
        return (
        (new InlineKeyboard())
        // .text('📖Статус сервера', CommandList.SERVER_STATUS).row()
        .text('🤖Список моих ботов', CommandList.BOT_LIST).row()
        .text('👥Список пользователей', CommandList.USERS_LIST).row()
        .text('🔑Список паролей', CommandList.PASSWORDS_LIST));
    } else {
        return (
            (new InlineKeyboard())
            .text('Список моих ботов', CommandList.BOT_LIST));
    }
}

export async function renderMainScreen(params: RenderMainScreenProps) {
    return new Promise<void>(async (resolve) => {
        const keyboard = getKeyboard(params.admin);
        const config: any = {
            reply_markup: keyboard,
            chatid: params.chatid,
            text: 'Выберите пункт меню'
        };

        if (params.send) {
            config.send = params.send;
        }

        await sendMessageAuto(config).catch(() => false);

        resolve();
    });
}