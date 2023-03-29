import cron from 'node-cron';
import { sendArticleToRecievers } from '../Handler/states/sendArticleToRecievers.js';
import { LogTags, showNotice } from '../Logging/ConsoleLog.js';
import { getTimes } from './Timeset.js';


async function isItTime() {
    return new Promise<boolean>(async (resolve) => {
        let timeset = await getTimes();
        let weekDay = (new Date()).getDay() - 1;
        let hour = (new Date()).getHours();
    
        if (weekDay in timeset) {
            if (timeset[weekDay].includes(hour)) {
                resolve(true);
                return;
            }
        }
    
        resolve(false);
        return;
    });
}

export function getCronSchedule() {
    showNotice('Creating cron instance...', LogTags.CRON)
    const task = cron.schedule('1 * * * *', () => {
        isItTime().then((send) => {
            if (send) {
                sendArticleToRecievers();
            }
        });
    }, {
        scheduled: false
    });
    return task;
}