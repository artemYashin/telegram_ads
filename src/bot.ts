// Loading config
import { config } from 'dotenv';
config();

import { LogTags, showCriticalError, showNotice, showSuccess, showWarningError } from './modules/Logging/ConsoleLog.js';
import { initDatabase } from './modules/Database/index.js';
import { initBot } from './modules/Bot/Bot.js';

// Database initialization
await initDatabase();

// Token check
showNotice('Check if token is set...', LogTags.INIT);
if (!process.env.TELEGRAM_BOT_TOKEN) {
    showCriticalError('Telegram token not found;');
    showCriticalError('Add valid token to the file: .env;');
    showWarningError('Create token:');
    showWarningError('https://t.me/BotFather;');
    process.exit();
}
showSuccess('Check if token is set... success', LogTags.INIT)

initBot();