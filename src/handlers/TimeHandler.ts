import { storage } from "@drincs/pixi-vn/storage";
import { TIME_DATA_KEY } from "../constants";
import { setLastEvent } from "../functions/tracking-changes";
import type TimeDataType from "../types/TimeDataType";
import type { TimeSettings, TimeSlotInterface } from "../types/TimeSettings";
import TimeHandlerSettings from "./TimeHandlerSettings";

export default class TimeHandler {
    initialize(settings: TimeSettings) {
        const {
            dayStartTime = 0,
            dayEndTime = 24,
            defaultTimeSpent = 1,
            timeSlots = [],
            weekLength = 7,
            weekendStartDay = weekLength - 1,
            getDayName,
        } = settings;
        TimeHandlerSettings.dayStartTime = dayStartTime;
        TimeHandlerSettings.dayEndTime = dayEndTime;
        TimeHandlerSettings.defaultTimeSpent = defaultTimeSpent;
        TimeHandlerSettings.timeSlots = timeSlots;
        TimeHandlerSettings.weekLength = weekLength;
        if (weekendStartDay >= TimeHandlerSettings.weekLength) {
            console.warn(`[NQTR] Weekend start day should be less than week length ${weekLength}, so will be ignored`);
        } else {
            TimeHandlerSettings.weekendStartDay = weekendStartDay;
        }
        TimeHandlerSettings.getDayName = getDayName;
    }
    get dayStartTime(): number {
        return TimeHandlerSettings.dayStartTime;
    }
    get dayEndTime(): number {
        return TimeHandlerSettings.dayEndTime;
    }
    get defaultTimeSpent(): number {
        return TimeHandlerSettings.defaultTimeSpent;
    }
    get timeSlots(): TimeSlotInterface[] {
        return TimeHandlerSettings.timeSlots;
    }
    get weekLength(): number {
        return TimeHandlerSettings.weekLength;
    }
    get weekendStartDay(): number {
        return TimeHandlerSettings.weekendStartDay;
    }
    /**
     * Week days name
     * @param weekDayNumber The current week day number (from: 0 - to: {@link weekLength} - 1).
     * @returns The name of the week day.
     * @example
     * ```ts
     * (weekDayNumber: number) => {
     *     const weekDaysNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
     *     return weekDaysNames[weekDayNumber];
     * }
     * ```
     */
    get getDayName() {
        return TimeHandlerSettings.getDayName;
    }

    /**
     * Get the current time. Time is a numeric variable used to determine and manage time during a day/date.
     * It's recommended to use currentTime as if it were the current time. If you also want to manage minutes, you can use a float value.
     */
    get currentTime(): number {
        let data = storage.get<TimeDataType>(TIME_DATA_KEY) || {};
        if (data.hasOwnProperty("currentTime") && typeof data.currentTime === "number") {
            return data.currentTime;
        }
        return this.dayStartTime;
    }
    set currentTime(value: number | undefined) {
        let prev = storage.get<TimeDataType>(TIME_DATA_KEY) || {};
        let data = { ...prev };
        if (typeof value === "number") {
            data.currentTime = value;
        } else {
            delete data.currentTime;
        }
        setLastEvent({
            type: "edittime",
            prev: prev,
            value: data,
        });
        storage.set(TIME_DATA_KEY, data);
    }
    /**
     * Get the current date. Date is a numeric variable used to determine and manage the number of days passed.
     * It's recommended to use currentDate as if it were the current day.
     */
    get currentDate(): number {
        let data = storage.get<TimeDataType>(TIME_DATA_KEY) || {};
        if (data.hasOwnProperty("currentDate") && typeof data.currentDate === "number") {
            return data.currentDate;
        }
        return 0;
    }
    set currentDate(value: number | undefined) {
        let prev = storage.get<TimeDataType>(TIME_DATA_KEY) || {};
        let data = { ...prev };
        if (typeof value === "number") {
            data.currentDate = value;
        } else {
            delete data.currentDate;
        }
        setLastEvent({
            type: "edittime",
            prev: prev,
            value: data,
        });
        storage.set(TIME_DATA_KEY, data);
    }
    /**
     * If the current day is greater than or equal to the weekend start day, then it will return true.
     */
    get isWeekend(): boolean {
        return this.currentWeekDayNumber >= this.weekendStartDay;
    }
    /**
     * Get the current week day number (from: 1 - to: {@link weekLength}).
     * For example, if the week length is 7 and the current day is 10, then the result will be 4.
     */
    get currentWeekDayNumber(): number {
        let result = this.currentDate % this.weekLength;
        return result + 1;
    }
    /**
     * Get the current week day name. If the week days names are not defined, then it will return undefined.
     * For example, if the week days names are ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] and the current day is 10, then the result will be 'Thursday'.
     * @default ""
     */
    get currentDayName(): string {
        if (!this.getDayName) {
            console.warn(`[NQTR] Week days names are not defined, so currentDayName will be empty`);
            return "";
        }
        return this.getDayName(this.currentWeekDayNumber - 1);
    }
    /**
     * Get the current {@link timeSlots} index.
     * You can use this property to create "Image that changes based on the time period":
     * @example
     * ```tsx
     * import { weekLength } from '@drincs/nqtr';
     *
     * function changeBackground() {
     *     return (
     *         <img src={`background-currentTimeSlot.currentTimeSlot.png`} />
     *     )
     * }
     */
    get currentTimeSlot(): number {
        if (this.timeSlots.length === 0) {
            console.warn("[NQTR] Time slots are not defined");
            return 0;
        }
        for (let index = 0; index < this.timeSlots.length; index++) {
            let slot = this.timeSlots[index];
            if (this.timeSlots.length > index + 1) {
                if (this.nowIsBetween(slot.startTime, this.timeSlots[index + 1].startTime)) {
                    return index;
                }
            }
        }
        return this.timeSlots.length - 1;
    }

    /**
     * This function will increase the current time by the given time spent.
     * If the new time is greater than or equal to the max day times, then it will increase the day and set the new time.
     * @param delta is the time spent in times (default: {@link defaultTimeSpent})
     * @returns currentTimeSlot.currentTime
     */
    increaseTime(delta: number = this.defaultTimeSpent): number {
        let newTime = this.currentTime + delta;
        if (newTime >= this.dayEndTime) {
            this.increaseDate();
            newTime = this.dayStartTime + (newTime - this.dayEndTime);
        }
        this.currentTime = newTime;
        return this.currentTime;
    }

    /**
     * This function will increase the current date by the given delta.
     * @param delta is the number of days to increase (default: 1)
     * @param time is the time of the new day (default: {@link dayStartTime})
     * @returns timeTracker.currentDate
     */
    increaseDate(delta: number = 1, time: number = this.dayStartTime): number {
        let newDate = this.currentDate + delta;
        this.currentDate = newDate;
        this.currentTime = time;
        return this.currentDate;
    }

    /**
     * This function will check if the current time is between the given times.
     * @param fromTime the starting time. If the {@link currentTime} is equal to this time, the function will return true.
     * @param toTime the ending time.
     * @returns true if the current time is between the given times, otherwise false.
     */
    nowIsBetween(fromTime: number | undefined, toTime: number | undefined): boolean {
        if (fromTime === undefined) {
            fromTime = this.dayStartTime - 1;
        }
        if (toTime === undefined) {
            toTime = this.dayEndTime + 1;
        }
        let currentTime = this.currentTime;
        if (fromTime < toTime) {
            return currentTime >= fromTime && currentTime < toTime;
        }
        return currentTime >= fromTime || currentTime < toTime;
    }
}
