import deleteMessage from "../../Api/deleteMessage.js";
import { getUserState } from "../../UserState/UserState.js";

export async function deleteLastButtons(chatid: number) {
    return new Promise<void>(async (resolve) => {
        const msgId = (await getUserState(chatid)).messageId;

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