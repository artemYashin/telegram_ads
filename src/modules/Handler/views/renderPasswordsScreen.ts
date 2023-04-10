import { InlineKeyboard } from "grammy";
import { CommandList } from "../states/commandList.js";
import { sendMessageAuto } from "../../Api/sendMessageAuto.js";
import { consts } from "../consts.js";

function getKeyboard() {
    return (
    (new InlineKeyboard())
    .text('📃Текущие пароли', CommandList.RENDER_PASSWORDS).row()
    .text('➕Создать пароль', CommandList.GENERATE_PASSWORD).row()
    .text(consts.home, CommandList.CANCEL_STATE));
}

interface RenderPasswordsScreenProps { 
    send?: boolean;
    text?: string;
    chatid: number;
}

export async function renderPasswordsScreen(params: RenderPasswordsScreenProps) {
    return new Promise<void>(async (resolve) => {
        const keyboard = getKeyboard();

        const config: any = {
            text: params.text ?? 'Выберите пункт меню',
            send: params.send ?? false,
            chatid: params.chatid,
            reply_markup: keyboard
        }

        await sendMessageAuto(config);
        resolve();
    });
}