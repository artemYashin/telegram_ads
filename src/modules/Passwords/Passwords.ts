import { Paths, getData, setData } from "../Database/Database.js";

type OneTimePasswordNotUsed = {
    password: string;
    used: false;
    admin: boolean;
}

type OneTimePasswordUsed = {
    password: string;
    used: true;
    admin: boolean;
    chatid: number;
} 

export interface CreatePasswordResult {
    password: string;
}

export interface UsePasswordResult {
    admin: boolean;
}

export type OneTimePassword = OneTimePasswordNotUsed | OneTimePasswordUsed;

function generatePassword() {
    return Math.random().toString(36).slice(-8);
}

export async function createPassword(admin: boolean): Promise<CreatePasswordResult> {
    return new Promise<CreatePasswordResult>(async (resolve) => {
        const password = generatePassword();
        const passwords = await getPasswords();
        passwords.push({password: password, used: false, admin: admin});
        await setPasswords(passwords);
        resolve({
            password: password
        });
    });
}

export async function usePassword(password: string, chatid: number): Promise<UsePasswordResult> {
    return new Promise<UsePasswordResult>(async (resolve, reject) => {
        const passwords = await getPasswords();
        
        for (let i = 0; i < passwords.length; i++) {
            if (passwords[i].password == password && passwords[i].used === false) {
                passwords[i].used = true;
                (passwords[i] as OneTimePasswordUsed).chatid = chatid;

                setPasswords(passwords).then(() => {
                    resolve({
                        admin: passwords[i].admin
                    });
                })
                
                return;
            }
        }
        reject();
    });
}

export async function getPasswords(): Promise<OneTimePassword[]> {
    return new Promise<OneTimePassword[]>(async (resolve) => {
        getData(Paths.PASSWORDS).then((passwords: OneTimePassword[]) => {
            resolve(passwords);
        }).catch(() => {
            resolve([]);
        });
    });
}

export async function setPasswords(passwords: OneTimePassword[]): Promise<void> {
    return new Promise<void>(async (resolve) => {
        setData(Paths.PASSWORDS, passwords,true).then(() => {
            resolve();
        });
    });
}