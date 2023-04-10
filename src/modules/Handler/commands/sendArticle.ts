import { sendArticleToRecievers } from "../states/sendArticleToRecievers.js";
import { renderBotSettingsScreen } from "../views/renderBotSettingsScreen.js";

export async function sendArticle(chatid: number, botid: number) {
    await sendArticleToRecievers(botid);
    await renderBotSettingsScreen({
        chatid: chatid,
        botid: botid,
        text: 'Пост успешно отправлен!'
    });
}