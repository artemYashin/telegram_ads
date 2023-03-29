import { getData, setData } from "../Database/Database.js";
import { showWarningError } from "../Logging/ConsoleLog.js";

export async function getDayTimes(day: number) {
    return new Promise<Array<any>>(async (resolve) => {
        let timeset = await getData(`/timeset/${day}`).catch(() => false)
        
        if (timeset === false) {
            resolve([]);
            return;
        }

        resolve(timeset);
    });
}

export async function getTimes() {
    return new Promise<Array<any>>(async (resolve) => {
        let timeset = await getData(`/timeset`).catch(() => false)
        
        if (timeset === false) {
            resolve([]);
            return;
        }
        resolve(timeset);
    });
}

export async function setTime(day: number, time: number) {
    return new Promise<void>(async (resolve) => {
        let dayTime = await getDayTimes(day);
        if (dayTime.includes(time)) {
            dayTime = dayTime.filter((el) => el !== time );
        } else {
            dayTime.push(time);
        }
        await setData(`/timeset/${day}`, dayTime, true).catch((err) => {showWarningError(err)});
        resolve();
        return;
    });
}