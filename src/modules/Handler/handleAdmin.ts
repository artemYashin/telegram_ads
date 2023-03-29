import { LogTags, showNotice, showSuccess } from "../Logging/index.js";
import { getUserState, setUserState } from "../UserState/UserState.js";
import { renderMainScreen } from "./states/handleMainState.js";

export default async function handleAdmin(msg: string | undefined, chatid: number) {
    return new Promise<void>(async (resolve) => {
        if (msg != process.env.ADMIN_KEY_WORD || Number(process.env.USE_ADMIN_KEYWORD) !== 1) {
            resolve();
            return;
        } else {
            showNotice('Handling admin request.', LogTags.HANDLER)
            showSuccess('New admin is added.', LogTags.HANDLER);
            const currentState = await getUserState(chatid);
            currentState.admin = true;
            await setUserState(currentState);
            await renderMainScreen(chatid, true);
        }
        resolve();
    });
}