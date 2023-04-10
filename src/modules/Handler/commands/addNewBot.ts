import { State, findUser, updateUserState } from "../../UserState/UserState.js";
import { sendMessageAuto } from "../../Api/sendMessageAuto.js";
import { InlineKeyboard } from "grammy";
import { CommandList } from "../states/commandList.js";

export async function addNewBot(chatid: number, userid?: number) {
    return new Promise<void>(async (resolve) => {
        // Changing state to wait for token
        const user = await findUser(chatid);
        user.state = State.WAITING_FOR_TOKEN;
        if (userid) {
            user.state_for = `add-for__${userid}`;
        }
        await updateUserState(user);

        await sendMessageAuto({
            chatid: chatid,
            text: `Отправьте токен бота, полученный у @BotFather`,
            parse_mode: 'Markdown',
            reply_markup: (new InlineKeyboard()).text('Отменить', CommandList.CANCEL_STATE)
        }).catch(() => false)
        resolve();
    });
}