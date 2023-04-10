import { State, findUser, updateUserState } from "../../UserState/UserState.js";
import { sendMessageAuto } from "../../Api/sendMessageAuto.js";
import { InlineKeyboard } from "grammy";
import { CommandList } from "../states/commandList.js";
import { formatStateType } from "../../UserState/UserState.js";
import { StateTypes } from "../../UserState/UserState.js";

export async function changeBotPost(chatid: number, botid: number) {
    return new Promise<void>(async (resolve) => {
        // Changing state to wait for token
        const user = await findUser(chatid);
        user.state = State.WAITING_FOR_MSG;
        user.state_for = formatStateType(StateTypes.CHANGE_BOT_POST, botid.toString());
        await updateUserState(user);

        await sendMessageAuto({
            chatid: chatid,
            text: `Отправьте сообщение которое будет использоваться в качестве рекламного поста`,
            parse_mode: 'Markdown',
            reply_markup: (new InlineKeyboard()).text('Отменить', CommandList.CANCEL_STATE)
        }).catch(() => false)
        
        resolve();
    });
}