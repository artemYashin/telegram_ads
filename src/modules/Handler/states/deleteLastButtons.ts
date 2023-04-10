import deleteMessage from "../../Api/deleteMessage.js";
import { findUser } from "../../UserState/UserState.js";

export async function deleteLastButtons(chatid: number) {
    return new Promise<void>(async (resolve) => {
        const msgId = (await findUser(chatid)).messageId;

        if (msgId) {
            try {
                await deleteMessage(chatid, msgId);
            } catch {
                resolve();
            }
        }
        resolve();
    });
}