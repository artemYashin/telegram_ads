import { LogTags, showNotice, showSuccess } from "../Logging/index.js";
import { usePassword } from "../Passwords/Passwords.js";
import { createUser } from "../UserState/UserState.js";

export default async function handleNewUser(chatid: number, msg: string) {
    return new Promise<void>(async (resolve, reject) => {
        let usedPasswordResult = await usePassword(msg, chatid).catch(() => null);
        // Check if one time password is valid
        if (usedPasswordResult !== null) {
            await createUser(chatid, usedPasswordResult.admin);
            showNotice('One time password is used');
            resolve();
            return;
        }

        // Check if admin feature is disabled
        if (Number(process.env.USE_ADMIN_KEYWORD) !== 1) {
            reject('Admin word check is disabled, skipping...');
            return;
        }

        // Check if admin key word is correct
        if (msg == process.env.ADMIN_KEY_WORD) {
            showSuccess('New admin is added.', LogTags.HANDLER);
            await createUser(chatid, true);
            resolve();
            return;
        }

        reject();
    });
}