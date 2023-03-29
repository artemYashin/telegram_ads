import { Context } from "grammy";
import copyMessage from "../Api/copyMessage.js";
import sendMessage from "../Api/sendMessage.js";
import { saveArticle } from "../Article/Article.js";
import { LogTags, showNotice, showWarningError } from "../Logging/index.js";
import { getUserState, State } from "../UserState/index.js";
import { changeStateField } from "../UserState/UserState.js";
import handleAdmin from "./handleAdmin.js";
import { handleState } from "./handleState.js";
import { cancelState } from "./states/cancelState.js";
import { renderMainScreen } from "./states/handleMainState.js";

export async function handleRequest(ctx: Context) {
    showNotice('Message received.', LogTags.HANDLER);
    const chatId = ctx.update.message?.chat?.id;
    const msgId = ctx.update.message?.message_id;
    const text = ctx.update.message?.text;
    
    if (!chatId) {
        showWarningError('Failed to get chatID.');
        return;
    }

    // Handling admin request
    await handleAdmin(text, chatId);
    const state = await getUserState(chatId);
    
    if (!state || state.admin === false) {
        showNotice('Rejecting request.', LogTags.HANDLER);
        return;
    }

    if (state.state === State.WAITING_FOR_MSG && msgId) {
        await saveArticle(chatId, msgId);
        await changeStateField(chatId, {state: State.MAIN_SCREEN});
        await renderMainScreen(chatId, true);
    }

    if (text === '/start') {
        renderMainScreen(chatId, true);
    }
    // Reply with main page state
    // if (msgId) {
    //     // handleState(chatId);
    // } else {
    //     showWarningError('Failed to handle request.');
    // }
    // if (msgId) {
    //     const copyId = (await copyMessage(chatId, chatId, msgId)).message_id;
    //     sendMessage(chatId, 'Ваш рекламный пост будет выглядеть так:', {
    //         reply_to_message_id: copyId,
    //         chat_id: chatId
    //     })
    // }
    

    showNotice('Request end.', LogTags.HANDLER);
}