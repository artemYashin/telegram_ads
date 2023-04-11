import { Bot, Context } from "grammy";
import { CommandList } from "../Handler/states/commandList.js";
import { LogTags, showCriticalError, showError, showNotice, showSuccess, showWarningError } from "../Logging/ConsoleLog.js";
import { addReciever, removeReciever } from "../Recievers/Recievers.js";
import { getCronSchedule } from "../Timer/Cron.js";
import { handleMessage } from "../Handler/MessageHandler.js";
import { handleCommand } from "../Handler/CommandHandler.js";
import { getUserName } from "../Api/getUserName.js";
import { initManager } from "./BotsManager.js";
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
    showSuccess('Initializing cron... success', LogTags.CRON);
    (async function () {
        showNotice('Initializing users bots...');
        await initManager();
        showSuccess('Initializing users bots... success');
    })();
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
    
    // Message handler
    bot.on("message", (ctx: Context) => {
        (async () => { 
            handleMessage(ctx).catch(err => {
                showError(err);
            })
        })();
    });

    // Buttons handler
    bot.on('callback_query:data', (ctx) => {
        (async () => {
            const chatId = ctx.update.callback_query.from.id;
            await handleCommand(chatId, ctx.update.callback_query.data as CommandList).catch((err) => {
                showError(err);
            });
            try {
                await ctx.answerCallbackQuery(); // remove loading animation
            } catch {
                showNotice('Tried to answer callback query error');
            }
        })();
    });
    
    showSuccess('Setting up event handlers... success', LogTags.INIT)
}