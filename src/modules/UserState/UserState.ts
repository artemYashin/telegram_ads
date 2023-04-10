import { Paths } from "../Database/Database.js";
import { getData, setData } from "../Database/index.js";
import { Schedule } from "../Timer/Timeset.js";

export enum State {
    MAIN_SCREEN,
    WAITING_FOR_MSG,
    WAITING_FOR_TOKEN
} 

export enum StateTypes {
    CHANGE_BOT_POST = "change-bot-post"
}

export interface StateType {
    type: StateTypes;
    payload: string;
}

export type AdvertisementPost = {
    file_id?: string;
    bot_file_id?: string;
    file_url?: string;
    entities?: object[];
    text?: string;
}

export type Bot = {
    token: string;
    isActive: boolean;
    post?: AdvertisementPost;
    schedule: Schedule;
    id: number;
    recievers: number[]
}

export type User = {
    id: number;
    admin: boolean;
    isEnabled: boolean;
    state: State;
    state_for: string | false;
    messageId: number;
    bots: Bot[];
}

export async function createUser(id: number, admin: boolean): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        findUser(id).then((user: User) => {
            user.admin = admin;
            updateUserState(user).then(() => {
                resolve();
            });
        }).catch(() => {
            getUsers().then((users: User[]) => {
                users.push({
                    id: id,
                    admin: admin,
                    isEnabled: true,
                    state: State.MAIN_SCREEN,
                    state_for: false,
                    messageId: -1,
                    bots: []
                });
                setUsers(users).then(() => {
                    resolve();
                })
            });
        });
    });
}

export async function updateUserState(user: User): Promise<void> {
    return new Promise<void>(async (resolve) => {
        let isFound = false;

        const users = (await getUsers()).map((el: User) => {
            if (el.id !== user.id) return el;
            isFound = true;
            return user;
        });
        
        if (isFound) {
            setUsers(users);
        }

        resolve();
    });
}

async function setUsers(users: User[]): Promise<void> {
    return new Promise<void>(async (resolve) => {
        await setData(Paths.USERS, users, true);
        resolve();
    });
}

export async function getUsers(): Promise<User[]> {
    return new Promise<User[]>(async (resolve) => {
        getData(Paths.USERS).then((users: User[]) => {
            resolve(users);
        }).catch(() => {
            resolve([]);
        })
    });
}

export async function findUser(id: number): Promise<User> {
    return new Promise<User>(async (resolve, reject) => {
        getData(Paths.USERS).then((users: User[]) => {
            const user: User | undefined = users.find((value: User) => value.id === id);
            
            if (user === undefined) {
                reject('User not found');
                return;
            }
            
            resolve(user);
        }).catch(() => reject('User not found'));
    });
}

export async function findUserByBotId(botid: number): Promise<User> {
    return new Promise<User>(async (resolve, reject) => {
        const user = (await getUsers()).find((user: User) => {
            for(let i = 0; i < user.bots.length; i++) {
                if (user.bots[i].id == botid) {
                    return true;
                }

                return false;
            }
        });
        
        if (user === undefined) {
            reject();
            return;
        }

        resolve(user);
    });
}

export function parseStateType(state: string): StateType | undefined {
    const values = Object.values(StateTypes);

    for (let i = 0; i < values.length; i++) {
        if (state.startsWith(values[i])) {
            return {
                type: values[i],
                payload: state.split('__')[1]
            };
        }
    }

    return undefined;
};

export function formatStateType(state: StateTypes, payload: string) {
    return `${state}__${payload}`;
}