import { changeStateField } from "../../UserState/UserState.js";

export function updateMessageId(chatid: number, msgid: number) {
    changeStateField(chatid, {messageId: msgid});
}