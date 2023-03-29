import chalk from 'chalk';

export enum DISPLAY_LOGS_LEVELS {
    CRITICAL_ONLY = 0,
    WARNINGS = 1,
    NOTICES = 2,
    ERRORS = 3
}

export enum LogTags {
    NO_TAG = "",
    INIT = "Init",
    INFO = "Info",
    WARNING = "Warning",
    DATABASE = "Database",
    ERROR = "Error",
    HANDLER = "Handler",
    USER_STATE = "User State",
    CRON = 'Cron',
}

function timestamp(): string {
    return `[${(new Date()).toLocaleString()}] `;
}

export function showCriticalError(str: string, log: boolean = true) {
    console.log(chalk.red(`${timestamp()}${LogTags.ERROR}: ${str}`));
}

export function showWarningError(str: string, log: boolean = true) {
    if (Number(process.env.DISPLAY_LOGS) > 0) {
        console.log(chalk.yellow(`${timestamp()}${LogTags.WARNING}: ${str}`));
    }
}

export function showSuccess(str: string, tag: LogTags = LogTags.NO_TAG, log: boolean = true) {
    console.log(chalk.green(`${timestamp()}${tag ? tag + ': ' : ''}${str}`));
}

export function showNotice(str: string, tag: LogTags = LogTags.INFO, log: boolean = true) {
    if (Number(process.env.DISPLAY_LOGS) >= DISPLAY_LOGS_LEVELS.NOTICES) {
        console.log(chalk.blue(`${timestamp()}${tag}: ${str}`));
    }
}

export function showError(str: string, tag: LogTags = LogTags.ERROR, log: boolean = true) {
    if (Number(process.env.DISPLAY_LOGS) >= DISPLAY_LOGS_LEVELS.ERRORS) {
        console.log(chalk.cyan(`${timestamp()}${tag}: ${str}`));
    }
}
function saveLog(str: string, title: string) {
    //saving log
}