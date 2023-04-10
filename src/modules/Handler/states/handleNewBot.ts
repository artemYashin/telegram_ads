import { Bot } from 'grammy';
import { State, findUser, findUserByBotId, updateUserState } from '../../UserState/UserState.js';
import { renderBotsScreen } from '../views/renderBotsScreen.js';
import { deleteLastButtons } from './deleteLastButtons.js';

export async function handleNewBot(chatid: number, token: string, userid?: number) {
    return new Promise<void> (async (resolve) => {
        const contest = await findUserByBotId(Number(token)).catch(() => undefined);
        
        if (contest !== undefined) {
            resolve();
            return;
        }
        
        const bot = new Bot(token);
        let user;
        
        if (!userid) {
            user = await findUser(chatid);
        } else {
            user = await findUser(userid);
        }
        
        user.state = State.MAIN_SCREEN;
        user.state_for = false;

        const botInfo = await bot.api.getMe().catch(() => false);

        await deleteLastButtons(chatid);

        const config: any = {
            chatid: chatid,
            send: true,
        };

        if (userid) {
            config.userid = userid;
        }

        if (botInfo !== false) {
            config.text = `Бот ${(botInfo as any).first_name} успешно добавлен!`;
            user.bots.push({
                id: (botInfo as any).id,
                token: token,
                isActive: true,
                schedule: {},
                recievers: []
            });
            await renderBotsScreen(config);
        } else {
            config.text = 'Не удалось добавить бота';
            await renderBotsScreen(config);
        }

        await updateUserState(user);
        resolve();
    });
}