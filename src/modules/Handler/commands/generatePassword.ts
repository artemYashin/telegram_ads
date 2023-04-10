import { sendMessageAuto } from "../../Api/sendMessageAuto.js";
import { CreatePasswordResult, createPassword } from "../../Passwords/Passwords.js";
import { renderPasswordsScreen } from "../views/renderPasswordsScreen.js";

export async function generatePassword(chatid: number) {
    return new Promise<void>(async (resolve) => {
        const password = await createPassword(false).then((res: CreatePasswordResult) => res.password);
        await sendMessageAuto({
            chatid: chatid,
            text: `Одноразовый пароль:\n*${password}*`,
            parse_mode: 'Markdown',
            send: true
        }).catch(() => false)
        await renderPasswordsScreen({
            chatid: chatid,
            text: 'Пароль успешно сгенерирован!',
            send: true
        }).catch(() => false)
        resolve();
    });
}