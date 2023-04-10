import { URL } from "url";
import { InlineKeyboard, InputFile } from "grammy";
import { findUser, findUserByBotId } from "../UserState/UserState.js";
import editMessage from "./editMessage.js";
import sendMessage from "./sendMessage.js";
import { updateMessageId } from "../Handler/states/updateMessageId.js";
import { getBotInstance } from "../BotManager/Bot.js";
import { getBotInstance as getBotManagerInstance } from "../BotManager/BotsManager.js";
import { Message } from "discord.js";

export interface MessageDetails {
    chatid: number;
    send?: true;
    text: string;
    reply_markup?: InlineKeyboard;
    parse_mode?: string;
    entities?: object[];
    file_id?: string;
    file_url?: string;
    botid?: number;
}

export async function sendMessageAuto(params: MessageDetails): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
        const msgId = await findUser(params.chatid).then((user) => user.messageId).catch(() => -1);
        
        const config: any = {};

        if (params.reply_markup) {
            config.reply_markup = params.reply_markup;
        }

        if (params.parse_mode) {
            config.parse_mode = params.parse_mode;
        }

        if (params.file_id || params.file_url) {
            let bot = getBotInstance();
            if (params.botid) {
                const user = await findUserByBotId(params.botid);
                let botInstance = getBotManagerInstance(user.id, params.botid);

                if (botInstance) {
                    bot = botInstance.instance;
                }
            }
            if (params.text) {
                config.caption = params.text;
            }
            if (params.entities) {
                config.caption_entities = params.entities;
            }
            
            if (params.file_id) {
                resolve(await bot.api.sendPhoto(params.chatid, params.file_id, config).catch((err: any) => console.log(err)));
            } else if (params.file_url) {
                resolve(await bot.api.sendPhoto(params.chatid, new InputFile(new URL(params.file_url)), config).catch((err: any) => console.log(err)));
            }
        } else if (msgId > 0 && !params.send) {
            if (params.entities) {
                config.entities = params.entities;
            }
            resolve(await editMessage(params.chatid, msgId, params.text, config).catch(() => {
                reject();
            }));
        } else {
            if (params.entities) {
                config.entities = params.entities;
            }
            const response = await sendMessage(params.chatid, params.text, config, params.botid).catch(() => {
                reject();
            });

            if (params.reply_markup) {
                updateMessageId(params.chatid, (response as any).message_id);
            }
            
            resolve(response);
        }
    });
}