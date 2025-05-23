import { storage } from "@drincs/pixi-vn";
import { TIME_DATA_KEY } from "../constants";
import { setLastEvent } from "../functions/tracking-changes";
import TimeDataType from "../types/TimeDataType";
import { ITimeStlot, TimeSettings } from "../types/TimeSettings";
import TimeManagerSettings from "./TimeManagerSettings";

export default class TimeManager {
    initialize(settings: TimeSettings) {
        const {
            minDayHours = 0,
            maxDayHours = 24,
            defaultTimeSpent = 1,
            timeSlots = [],
            weekLength = 7,
            weekendStartDay = weekLength - 1,
            weekDaysNames = [],
        } = settings;
        TimeManagerSettings.minDayHours = minDayHours;
        TimeManagerSettings.maxDayHours = maxDayHours;
        TimeManagerSettings.defaultTimeSpent = defaultTimeSpent;
        TimeManagerSettings.timeSlots = timeSlots;
        TimeManagerSettings.weekLength = weekLength;
        if (weekendStartDay >= TimeManagerSettings.weekLength) {
            console.warn(`[NQTR] Weekend start day should be less than week length ${weekLength}, so will be ignored`);
        } else {
            TimeManagerSettings.weekendStartDay = weekendStartDay;
        }
        if (weekDaysNames.length !== weekLength) {
            console.warn(`[NQTR] Week days names should be equal to week length ${weekLength}, so will be ignored`);
        } else {
            TimeManagerSettings.weekDaysNames = weekDaysNames;
        }
    }
    get minDayHours(): number {
        return TimeManagerSettings.minDayHours;
    }
    get maxDayHours(): number {
        return TimeManagerSettings.maxDayHours;
    }
    get defaultTimeSpent(): number {
        return TimeManagerSettings.defaultTimeSpent;
    }
    get timeSlots(): ITimeStlot[] {
        return TimeManagerSettings.timeSlots;
    }
    get weekLength(): number {
        return TimeManagerSettings.weekLength;
    }
    get weekendStartDay(): number {
        return TimeManagerSettings.weekendStartDay;
    }
    get weekDaysNames(): string[] {
        return TimeManagerSettings.weekDaysNames;
    }

    /**
     * Get the current hour
     */
    get currentHour(): number {
        let data = storage.getVariable<TimeDataType>(TIME_DATA_KEY) || {};
        if (data.hasOwnProperty("currentHour") && typeof data.currentHour === "number") {
            return data.currentHour;
        }
        return this.minDayHours;
    }
    set currentHour(value: number | undefined) {
        let prev = storage.getVariable<TimeDataType>(TIME_DATA_KEY) || {};
        let data = { ...prev };
        if (typeof value === "number") {
            data.currentHour = value;
        } else {
            delete data.currentHour;
        }
        setLastEvent({
            type: "edittime",
            prev: prev,
            value: data,
        });
        storage.setVariable(TIME_DATA_KEY, data);
    }
    /**
     * Get the current day
     */
    get currentDay(): number {
        let data = storage.getVariable<TimeDataType>(TIME_DATA_KEY) || {};
        if (data.hasOwnProperty("currentDay") && typeof data.currentDay === "number") {
            return data.currentDay;
        }
        return 0;
    }
    set currentDay(value: number | undefined) {
        let prev = storage.getVariable<TimeDataType>(TIME_DATA_KEY) || {};
        let data = { ...prev };
        if (typeof value === "number") {
            data.currentDay = value;
        } else {
            delete data.currentDay;
        }
        setLastEvent({
            type: "edittime",
            prev: prev,
            value: data,
        });
        storage.setVariable(TIME_DATA_KEY, data);
    }
    /**
     * If the current day is greater than or equal to the weekend start day, then it will return true.
     */
    get isWeekend(): boolean {
        return this.currentWeekDayNumber >= this.weekendStartDay;
    }
    /**
     * Get the current week day number (1 - {@link weekLength}).
     * For example, if the week length is 7 and the current day is 10, then the result will be 4.
     */
    get currentWeekDayNumber(): number {
        let result = this.currentDay % this.weekLength;
        return result + 1;
    }
    /**
     * Get the current week day name. If the week days names are not defined, then it will return undefined.
     * For example, if the week days names are ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] and the current day is 10, then the result will be 'Thursday'.
     * @default ""
     */
    get currentDayName(): string {
        let weekDayNumber = this.currentWeekDayNumber - 1;
        if (weekDayNumber >= this.weekDaysNames.length) {
            console.warn(`[NQTR] Week day name is not defined for day ${weekDayNumber}`, this.weekDaysNames);
            return "";
        }
        return this.weekDaysNames[weekDayNumber];
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
                if (this.nowIsBetween(slot.startHour, this.timeSlots[index + 1].startHour)) {
                    return index;
                }
            }
        }
        return this.timeSlots.length - 1;
    }

    /**
     * This function will increase the current hour by the given time spent.
     * If the new hour is greater than or equal to the max day hours, then it will increase the day and set the new hour.
     * @param timeSpent is the time spent in hours (default: {@link defaultTimeSpent})
     * @returns currentTimeSlot.currentHour
     */
    increaseHour(timeSpent: number = this.defaultTimeSpent): number {
        let newHour = this.currentHour + timeSpent;
        if (newHour >= this.maxDayHours) {
            this.increaseDay();
            newHour = this.minDayHours + (newHour - this.maxDayHours);
        }
        this.currentHour = newHour;
        return this.currentHour;
    }

    /**
     * This function will increase the current day by the given days.
     * @param newDayHour is the hour of the new day (default: {@link minDayHours})
     * @param days is the number of days to increase (default: 1)
     * @returns timeTracker.currentDay
     */
    increaseDay(newDayHour: number = this.minDayHours, days: number = 1): number {
        let newDay = this.currentDay + days;
        this.currentDay = newDay;
        this.currentHour = newDayHour;
        return this.currentDay;
    }

    /**
     * This function will check if the current hour is between the given hours.
     * @param fromHour the starting hour. If the {@link currentHour} is equal to this hour, the function will return true.
     * @param toHour the ending hour.
     * @returns true if the current hour is between the given hours, otherwise false.
     */
    nowIsBetween(fromHour: number | undefined, toHour: number | undefined): boolean {
        if (fromHour === undefined) {
            fromHour = this.minDayHours - 1;
        }
        if (toHour === undefined) {
            toHour = this.maxDayHours + 1;
        }
        let currentHour = this.currentHour;
        if (fromHour < toHour) {
            return currentHour >= fromHour && currentHour < toHour;
        }
        return currentHour >= fromHour || currentHour < toHour;
    }
}
