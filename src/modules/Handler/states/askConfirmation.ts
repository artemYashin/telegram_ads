import { InlineKeyboard } from "grammy"; 
import { sendMessageAuto } from "../../Api/sendMessageAuto.js";
import { CommandList } from "./commandList.js";

function getConfirmKeyboard(callback: string) {
    return (new InlineKeyboard()).text('✅Подтвердить✅', callback).text('❌Отменить❌', CommandList.CANCEL_STATE);
}

export async function askConfirmation(chatid: number, callback: string, text: string = "Подтвердите действие") {
    return new Promise<void>(async (resolve) => {
        await sendMessageAuto({
            chatid: chatid,
            text: text ?? 'Подтвердите действие',
            reply_markup: getConfirmKeyboard(callback)
        }).catch(() => false);
        resolve();
    });
}