import { sendMessageAuto } from "../../Api/sendMessageAuto.js";
import copyMessage from "../../Api/copyMessage.js";
import { getArticle } from "../../Article/Article.js";
import { renderBotSettingsScreen } from "../views/renderBotSettingsScreen.js";
import { findUserByBotId } from "../../UserState/UserState.js";

export async function showBotPost(chatid: number, botid: number) {
    return new Promise<void>(async (resolve) => {
        const user = await findUserByBotId(botid);
        const article: any = (await getArticle(user.id, botid).catch(() => false));
        
        if (article === false || article === undefined) {
            await renderBotSettingsScreen({
                chatid: chatid,
                botid: botid,
                text: 'Рекламный пост не установлен'
            });
            resolve();
            return;
        } else {
            let res = await sendMessageAuto({
                chatid: chatid,
                text: article.text,
                entities: article.entities,
                file_id: article.file_id,
            }).catch(() => false);

            if (res === false) {
                await renderBotSettingsScreen({
                    chatid: chatid,
                    botid: botid,
                    text: 'Рекламный пост был удален пользователем'
                });
            } else {
                await renderBotSettingsScreen({
                    chatid: chatid,
                    botid: botid,
                    send: true
                });
            }
        }

        resolve();
    });
}