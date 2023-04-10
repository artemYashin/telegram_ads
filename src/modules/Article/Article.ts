import { getBotInstance } from "../BotManager/Bot.js";
import { getBotInstance as getBotManagerInstance } from "../BotManager/BotsManager.js";
import { AdvertisementPost, Bot, State, StateTypes, findUser, findUserByBotId, parseStateType, updateUserState } from "../UserState/UserState.js";

export async function getArticle(chatid: number, botid: number): Promise<AdvertisementPost | undefined> {
    return new Promise<AdvertisementPost | undefined>(async (resolve, reject) => {
        const user = await findUser(chatid);
        const bot = user.bots.find((bot: Bot) => bot.id == botid);

        if (bot === undefined) {
            reject();
            return;
        }

        resolve(bot.post);
    });
}

export async function saveArticle(chatid: number, post: AdvertisementPost) {
    return new Promise<number>(async (resolve, reject) => {
        const user = await findUser(chatid);

        if (user.state_for === false) {
            reject();
            return;
        }

        const state = parseStateType(user.state_for);

        if (state !== undefined && state.type == StateTypes.CHANGE_BOT_POST) {
            if (post.file_id) {
                const bot = getBotInstance();
                const file = await bot.api.getFile(post.file_id).catch(() => undefined);

                if (file !== undefined) {
                    post.file_url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
                }
            }
            const targetUser = await findUserByBotId(Number(state.payload));
            targetUser.bots = targetUser.bots.map((bot: Bot) => {

                if (Number(state.payload) == bot.id) {
                    bot.post = post;
                }

                return bot;
            });
            await updateUserState(targetUser);
            await updateUserState(user);
            resolve(Number(state.payload));
            return;
        }

        reject();
    });
}