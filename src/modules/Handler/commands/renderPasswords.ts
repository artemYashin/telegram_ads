import { sendMessageAuto } from "../../Api/sendMessageAuto.js";
import { CreatePasswordResult, OneTimePassword, createPassword, getPasswords } from "../../Passwords/Passwords.js";
import { renderPasswordsScreen } from "../views/renderPasswordsScreen.js";

const enabledEmoji = '✅';
const disabledEmoji = '❌';

function formatPasswords(passwords: OneTimePassword[]) {
    let result = 'Одноразовые пароли:\n\n';
    
    for (let password of passwords) {
        result += `Статус: ${password.used ? enabledEmoji : disabledEmoji} *${password.password}*\n`;
    }

    return result;
}
export async function renderPasswords(chatid: number) {
    return new Promise<void>(async (resolve) => {
        const passwords = await getPasswords();
        
        await sendMessageAuto({
            chatid: chatid,
            text: formatPasswords(passwords),
            parse_mode: 'Markdown',
            send: true
        }).catch(() => false)
        await renderPasswordsScreen({
            chatid: chatid,
            text: 'Выберите пункт меню',
            send: true
        }).catch(() => false)
        resolve();
    });
}