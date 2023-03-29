import { getData, setData } from "../Database/Database.js";
import { showCriticalError, showError } from "../Logging/ConsoleLog.js";

export type Reciever = {
    chatid: number;
}

export async function addReciever(reciever: Reciever) {
    return new Promise<void>(async (resolve) => {
        await setData('/', {
            recievers: {
                [reciever.chatid]: reciever
            }
        }, false);
        resolve();
    });
}

export async function removeReciever(reciever: Reciever) {
    return new Promise<void>(async (resolve) => {
        const recievers = await getRecievers();

        if (recievers.find((el) => el.chatid == reciever.chatid)) {
            await setData('/recievers', {...recievers.filter((el) => el.chatid !== reciever.chatid)}, true).catch((err) => {
                showCriticalError('Failed to update recievers list')
                showError(err);
            });
        }
        
        resolve();
    });
}

// export async function isRecieverExists(chatid: number): Promise<boolean> {
//     return new Promise<boolean>(async (resolve) => {
//         const reciever = (await getData('/recievers').then(res => res).catch(() => []))[chatid];

//         if (reciever) {
//             resolve(true);
//             return;
//         }

//         resolve(false);
//     });
// }

export async function getRecievers(): Promise<Reciever[]> {
    return new Promise<Reciever[]>(async (resolve) => {
        let result = await getData('/recievers').then().catch(() => {});
        if (result) {
            resolve(Object.values(result));
        } else {
            resolve([]);
        }
    });
}