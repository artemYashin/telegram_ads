import { Context } from "grammy";
import { LogTags, showError, showNotice, showWarningError } from "../Logging/index.js";
import { AdvertisementPost, findUser, findUserByBotId, State, updateUserState } from "../UserState/UserState.js";
import handleNewUser from "./handleNewUser.js";
import { saveArticle } from "../Article/Article.js";
import { renderMainScreen } from "./views/renderMainScreen.js";
import { handleNewBot } from "./states/handleNewBot.js";
import { checkUpdates } from "../BotManager/BotsManager.js";

export async function handleMessage(ctx: Context) {
    return new Promise<void>(async (resolve) => {
        showNotice('Message received.', LogTags.HANDLER);
        const chatId = ctx.update.message?.chat?.id;
        const msgId = ctx.update.message?.message_id;
        const msg = ctx.update.message?.text;
        let shouldRenderMainScreen = false;
    
        if (!chatId) {
            showWarningError('Failed to get chatID.');
            return;
        }
    
        // Creating new user
        if (msg) {
            shouldRenderMainScreen = await handleNewUser(chatId, msg).then(() => true).catch((err) => {
                return false;
            });
        }
    
        // Recieving user state
        const user = await findUser(chatId).catch(() => undefined);
        
        if (user === undefined) {
            showNotice('Rejecting request.', LogTags.HANDLER);
            return;
        }
    
        if (!user.isEnabled) {
            return false;
        }
    
        // Check if received new post
        if (user.state === State.WAITING_FOR_MSG && msgId) {
            const article: AdvertisementPost = {
            };
            
            if (ctx.update.message?.photo) {
                article.file_id = ctx.update.message.photo[2].file_id;
                
                if (ctx.update.message.caption) {
                    article.text = ctx.update.message.caption;
                }
    
                if (ctx.update.message.caption_entities) {
                    article.entities = ctx.update.message.caption_entities;
                }
            } else if (msg) {
                article.text = msg;
                article.entities = ctx.update.message?.entities;
            }
    
            await saveArticle(chatId, article).catch(() => false);
            user.state = State.MAIN_SCREEN;
            user.state_for = false;
            await updateUserState(user);
            shouldRenderMainScreen = true;
        }
    
        // Check if waiting for token
        if (user.state === State.WAITING_FOR_TOKEN && msg) {
            if (user.state_for !== false && user.state_for.startsWith('add-for')) {
                const [,userid] = user.state_for.split('__');
                await handleNewBot(chatId, msg, Number(userid));
                await checkUpdates();
            } else {
                await handleNewBot(chatId, msg);
                await checkUpdates();
            }
        }
    
        if (shouldRenderMainScreen || msg == '/start' || user.messageId < 0) {
            await renderMainScreen({
                chatid: chatId,
                admin: user.admin,
                send: true
            });
        }
    
        showNotice('Request end.', LogTags.HANDLER);
        resolve();
    });
}