import { getData, setData } from "../Database/index.js";

export enum State {
    MAIN_SCREEN,
    WAITING_FOR_MSG,
    CONFIRM_POST
} 

export type UserState = {
    id: number;
    admin: boolean;
    state: State;
    messageId: number;
}

const DEFAULT_STATE: UserState = {
    id: 0,
    admin: false,
    state: State.MAIN_SCREEN,
    messageId: -1,
}

export async function initUserState(chatid: number): Promise<UserState> {
    return new Promise<UserState>(async (resolve) => {
        await setData('/', {
            users: {
                [chatid]: {...DEFAULT_STATE, id: chatid}
            }
        }, false);
        resolve({...DEFAULT_STATE, id: chatid});
    });
}

export async function changeStateField(chatid: number, diff: object) {
    return new Promise<void>(async (resolve) => {
        await setUserState(Object.assign(await getUserState(chatid), diff));
        resolve();
    });
}

export async function setUserState(state: UserState) {
    return new Promise<void>(async (resolve) => {
        await setData('/', {
            users: {
                [state.id]: state
            }
        }, false);
        resolve();
    });
}

export async function getUserState(chatid: number): Promise<UserState> {
    return new Promise<UserState>(async (resolve, reject) => {
        const currentState = (await getData('/users').then(res => res).catch(() => []))[chatid];

        if (currentState) {
            resolve(currentState);
            return;
        }

        resolve(await initUserState(chatid));
    });
}