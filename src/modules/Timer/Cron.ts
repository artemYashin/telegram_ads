import cron from 'node-cron';
import { LogTags, showNotice } from '../Logging/ConsoleLog.js';
import { getUsers } from '../UserState/UserState.js';
import { Schedule } from './Timeset.js';
import { sendArticleToRecievers } from '../Handler/states/sendArticleToRecievers.js';

function isItTime(schedule: Schedule) {
    let weekDay = (new Date()).getDay() - 1;
    let hour = (new Date()).getHours();

    if (weekDay in schedule) {
        if (schedule[weekDay].includes(hour)) {
            return true;
        }
    }

    return false;
}

export function getCronSchedule() {
    showNotice('Creating cron instance...', LogTags.CRON)
    const task = cron.schedule('1 * * * *', async () => {
        const users = await getUsers();
        
        for (let user of users) {
            if (user.bots.length > 0) {
                for (let bot of user.bots) {
                    if (bot.isActive) {
                        if (isItTime(bot.schedule)) {
                            await sendArticleToRecievers(bot.id);
                        }
                    }
                }
            }
        }

    }, {
        scheduled: false
    });
    return task;
}