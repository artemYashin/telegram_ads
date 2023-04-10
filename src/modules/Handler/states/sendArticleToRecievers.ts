import { showCriticalError, showError, showWarningError } from "../../Logging/ConsoleLog.js";
import copyMessage from "../../Api/copyMessage.js";
import { getArticle } from "../../Article/Article.js";
import { getRecievers } from "../../Recievers/Recievers.js";
import { Bot, findUser, findUserByBotId, updateUserState } from "../../UserState/UserState.js";
import { getBotInstance as getBotInstance2 } from "../../BotManager/BotsManager.js";
import { bot, getBotInstance } from "../../BotManager/Bot.js";
import { sendMessageAuto } from "../../Api/sendMessageAuto.js";

export async function sendArticleToRecievers(botid: number) {
    return new Promise<void>(async (resolve) => {
        const user = await findUserByBotId(botid).catch(() => undefined as any);
        const recievers = await getRecievers(user.id, botid).catch(() => undefined as any);
        const article = await getArticle(user.id, botid).catch(() => undefined as any);
        
        let config: any = { text: article.text, botid: botid, entities: article.entities };

        if (!article.bot_file_id) {
            config.file_url = article.file_url;
        } else {
            config.file_id = article.bot_file_id;
        }

        try {
            if (article !== undefined) {
                for (let i = 0; i < recievers.length; i++) {
                    config.chatid = recievers[i].chatid
                    if (config.file_url) {
                        const result = await sendMessageAuto(config).catch(() => {
                            showCriticalError('Failed to send article to the chat ID: ' + recievers[i].chatid)
                        });
                        if (result.photo) {
                            const fileId = result.photo[2].file_id;
                            
                            if (fileId) {
                                article.bot_file_id = fileId;

                                user.bots = user.bots.map((bot: Bot) => {
                                    if (bot.id == botid) {
                                        bot.post = article;
                                    }

                                    return bot;
                                });

                                await updateUserState(user);

                                config = { text: article.text, botid: botid, entities: article.entities, file_id: fileId };
                            }
                        }
                    } else {
                        await sendMessageAuto(config).catch(() => {
                            showCriticalError('Failed to send article to the chat ID: ' + recievers[i].chatid)
                        });
                    }
                }
            }
        } catch (err: any) {
            showWarningError('Error to send article.');
            showError(err);
        }
        resolve();
    })
}