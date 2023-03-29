import { LogTags, showCriticalError, showError, showNotice, showSuccess, showWarningError } from '../Logging/index.js';
import { JsonDB, Config } from 'node-json-db';

const db = new JsonDB(new Config('database', true, false, '/'));

export async function getData(path: string) {
    return new Promise<any>(async (resolve, reject) => {
        try {
            const data = await db.getData(path);
            resolve(data);
        } catch {
            showNotice(`Tried to access not existing path ${path}`, LogTags.DATABASE)
            reject();
        }
    });
}

export async function setData(path: string, data: any, override: boolean) {
    return db.push(path, data, override);
}

async function init() {
    return new Promise<void> (async (resolve, reject) => {
        try {
            const isInited = await getData("/init").then((res) => res).catch((err) => {
                showCriticalError('Failed to fetch state of database');
                showError(err);
                return false;
            });
            
            if (isInited !== false) {
                resolve();
                return;
            }
        
            showCriticalError('Creating database...')

            try {
                await db.push('/init', true);
                showSuccess('Creating database... success', LogTags.DATABASE)
                resolve();
            } catch {
                showCriticalError('Failed to create database!');
                reject();
            }
        } catch {
            showCriticalError('Database error.')
            showWarningError('If you are running this app for the first time, try deleting database.json');
        }
    })
}

export async function initDatabase() {
    return new Promise<void>(async (resolve) => {
        showNotice('Initializing database...', LogTags.DATABASE);
        try {
            await init();
            showSuccess('Initializing database... success', LogTags.DATABASE)
            resolve();
        } catch(e) {
            showCriticalError('Initializing database... failed')
            process.exit();
        }
        resolve();
    });
}