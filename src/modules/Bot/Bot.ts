import { Bot, Context } from "grammy";
import { handleRequest } from "../Handler/Handler.js";
import { handleState } from "../Handler/handleState.js";
import { CommandList } from "../Handler/states/commandList.js";
import { LogTags, showCriticalError, showNotice, showSuccess, showWarningError } from "../Logging/ConsoleLog.js";
import { addReciever, removeReciever } from "../Recievers/Recievers.js";
import { getCronSchedule } from "../Timer/Cron.js";
export let bot: Bot;

export function getBotInstance(): Bot {
    return bot;
}

export function initBot() {
    showNotice('Creating instance of bot object...', LogTags.INIT)
    bot = new Bot(process.env.TELEGRAM_BOT_TOKEN as string);
    showSuccess('Creating instance of bot object... success', LogTags.INIT)

    addEventHandler();
    showNotice('Initializing cron...', LogTags.CRON);
    getCronSchedule().start();
    showSuccess('Initializing cron... success', LogTags.CRON)
    showSuccess('**Bot is running!** All checks have passed.')
    bot.start().then(() => {
        showCriticalError('Bot has disabled')
    }).catch((err) => {
        showCriticalError('Bot has disabled due to error');
        showCriticalError(err);
        showWarningError('Check if TELEGRAM_BOT_TOKEN is set correctly')
        process.exit();
    });
}

function addEventHandler() {
    showNotice('Setting up event handlers...', LogTags.INIT)
    bot.on("message", async (ctx: Context) => {
        const chatId = ctx.update.message?.chat?.id;
        handleRequest(ctx);
    });
    bot.on('callback_query:data', async (ctx) => {
        const chatId = ctx.update.callback_query.from.id;
        await handleState(chatId, ctx.update.callback_query.data as CommandList);
        try {
            await ctx.answerCallbackQuery(); // remove loading animation
        } catch {
            showNotice('Tried to answer callback query error');
        }
    });
    bot.on('channel_post', async (ctx) => {
        const chatId = ctx.update.channel_post.chat.id;

        if (chatId && chatId < 0) {
            await addReciever({chatid: chatId });
        }
    });
    bot.on("my_chat_member", async (ctx) => {
        showNotice('Handling member update')
        if (ctx.update.my_chat_member.chat.type == "channel") {
            showNotice('Handling channel')
            if ((ctx.update.my_chat_member.new_chat_member as any).can_post_messages == true) {
                showNotice('Adding new channel')
                await addReciever({chatid: ctx.update.my_chat_member.chat.id});
            } else {
                showNotice('Removing channel')
                await removeReciever({chatid: ctx.update.my_chat_member.chat.id});
            }
        } else {
            showNotice('Handling chat/group')
            if (ctx.update.my_chat_member.new_chat_member.status == "left" || ctx.update.my_chat_member.new_chat_member.status == "kicked") {
                showNotice('Removing chat/group')
                await removeReciever({chatid: ctx.update.my_chat_member.chat.id});
            } else {
                showNotice('Adding chat/group')
                await addReciever({chatid: ctx.update.my_chat_member.chat.id});
            }
        }
    });
    showSuccess('Setting up event handlers... success', LogTags.INIT)
}