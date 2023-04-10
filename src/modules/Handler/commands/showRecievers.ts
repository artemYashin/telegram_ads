import { showWarningError } from "../../Logging/ConsoleLog.js";
import { getChat } from "../../Api/getChat.js";
import { getRecievers, removeReciever } from "../../Recievers/Recievers.js";
import { renderBotSettingsScreen } from "../views/renderBotSettingsScreen.js";
import { getBotInstance } from "../../BotManager/BotsManager.js";
import { findUserByBotId } from "../../UserState/UserState.js";

export async function showRecievers(chatid: number, botid: number) {
    return new Promise<void>(async (resolve) => {
        let msgText;
        const user = await findUserByBotId(botid);
        const recievers = await getRecievers(user.id, botid);

        let instance = getBotInstance(user.id, botid)?.instance;

        if (recievers.length > 0 && instance !== undefined) {
        
            const promises = recievers.map(({ chatid: recieverid }) => {
                return (instance?.api.getChat(recieverid) as any).catch((err: any) => {
                    if (err.error_code == 403) {
                        showWarningError("Failed to get information about chat " + recieverid);
                        removeReciever({ chatid: err.payload.chat_id }, botid);
                    }

                    return { deleted: true };
                })
            });
    
            const res: any = [];
    
            await Promise.all(promises).then((result) => {
                result.forEach((elem, i) => {
                    if (elem.deleted == true) return;
                    res.push(`*${i + 1}*) *${elem.title}* _:${Math.abs(elem.id)}_`);
                });
            });
    
            if (res.length > 0) {
                msgText = res.join("\n");
            } else {
                msgText = "Получателей нет";
            }
        } else {
            msgText = "Получателей нет";
        }

        await renderBotSettingsScreen({
            chatid: chatid,
            botid: botid,
            text: msgText
        }).catch(() => undefined);
    
        resolve();
    });
}
  