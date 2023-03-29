import { showCriticalError, showError, showWarningError } from "../../Logging/ConsoleLog.js";
import copyMessage from "../../Api/copyMessage.js";
import { getArticle } from "../../Article/Article.js";
import { getRecievers } from "../../Recievers/Recievers.js";

export async function sendArticleToRecievers() {
    return new Promise<void>(async (resolve) => {
        const recievers = await getRecievers();
        const article = await getArticle();
        try {
            if (article !== false) {
                for (let i = 0; i < recievers.length; i++) {
                    await copyMessage(recievers[i].chatid, article.chatid, article.msgid).catch(() => {
                        showCriticalError('Failed to send article to the chat ID: ' + recievers[i].chatid)
                    });
                }
            }
        } catch (err: any) {
            showWarningError('Error to send article.')
            showError(err);
        }
        resolve();
    })
}