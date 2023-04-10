import { findUser, updateUserState } from "../../UserState/UserState.js";

export async function updateMessageId(chatid: number, msgid: number) {
    return new Promise<void>(async (resolve) => {
        const user = await findUser(chatid);
        user.messageId = msgid;
        await updateUserState(user);
        resolve();
    });
}