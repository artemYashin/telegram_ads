import {Bot} from 'grammy';

export async function getBotName(token: string) {
    return new Promise<string>(async (resolve) => {
        const bot = new Bot(token);
        const result = await bot.api.getMe();
        resolve(result.first_name);
    });
}