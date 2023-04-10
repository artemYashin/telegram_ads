export type Schedule = {
    [key: number]: number[];
}

export function setTime(schedule: Schedule, day: number, time: number) {
    if (schedule[day]) {
        if (schedule[day].includes(time)) {
            schedule[day] = schedule[day].filter((el) => el != time);
        } else {
            schedule[day].push(time);
        }
    } else {
        schedule[day] = [time];
    }

    return schedule;
}