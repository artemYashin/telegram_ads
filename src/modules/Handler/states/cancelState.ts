import { changeStateField, getUserState, State } from "../../UserState/UserState.js";
import { renderMainScreen } from "./handleMainState.js";

export async function cancelState(chatid: number) {
    return new Promise<void>(async (resolve) => {
        await changeStateField(chatid, { state: State.MAIN_SCREEN });
        await renderMainScreen(chatid);
        resolve();
    });
}