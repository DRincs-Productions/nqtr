import type { TimeHandlerInterface } from "@/interface";
import { TIME_DATA_KEY } from "@/constants";
import { setLastEvent } from "@/functions/tracking-changes";
import TimeHandlerSettings from "@/handlers/TimeHandlerSettings";
import type TimeDataType from "@/types/TimeDataType";
import type { TimeSettings, TimeSlotInterface } from "@/types/TimeSettings";
import { storage } from "@drincs/pixi-vn/storage";

export default class TimeHandler implements TimeHandlerInterface {
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
            console.warn(
                `[NQTR] Weekend start day should be less than week length ${weekLength}, so will be ignored`,
            );
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
    get getDayName() {
        return TimeHandlerSettings.getDayName;
    }

    get currentTime(): number {
        const data = storage.get<TimeDataType>(TIME_DATA_KEY) || {};
        if (Object.hasOwn(data, "currentTime") && typeof data.currentTime === "number") {
            return data.currentTime;
        }
        return this.dayStartTime;
    }
    set currentTime(value: number | undefined) {
        const prev = storage.get<TimeDataType>(TIME_DATA_KEY) || {};
        const data = { ...prev };
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
    get currentDate(): number {
        const data = storage.get<TimeDataType>(TIME_DATA_KEY) || {};
        if (Object.hasOwn(data, "currentDate") && typeof data.currentDate === "number") {
            return data.currentDate;
        }
        return 0;
    }
    set currentDate(value: number | undefined) {
        const prev = storage.get<TimeDataType>(TIME_DATA_KEY) || {};
        const data = { ...prev };
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
    get isWeekend(): boolean {
        return this.currentWeekDayNumber >= this.weekendStartDay;
    }
    get currentWeekDayNumber(): number {
        const result = this.currentDate % this.weekLength;
        return result + 1;
    }
    get currentDayName(): string {
        if (!this.getDayName) {
            console.warn(`[NQTR] Week days names are not defined, so currentDayName will be empty`);
            return "";
        }
        return this.getDayName(this.currentWeekDayNumber - 1);
    }
    get currentTimeSlot(): number {
        if (this.timeSlots.length === 0) {
            console.warn("[NQTR] Time slots are not defined");
            return 0;
        }
        for (let index = 0; index < this.timeSlots.length; index++) {
            const slot = this.timeSlots[index];
            if (this.timeSlots.length > index + 1) {
                if (this.nowIsBetween(slot.startTime, this.timeSlots[index + 1].startTime)) {
                    return index;
                }
            }
        }
        return this.timeSlots.length - 1;
    }

    increaseTime(delta: number = this.defaultTimeSpent): number {
        let newTime = this.currentTime + delta;
        if (newTime >= this.dayEndTime) {
            this.increaseDate();
            newTime = this.dayStartTime + (newTime - this.dayEndTime);
        }
        this.currentTime = newTime;
        return this.currentTime;
    }

    increaseDate(delta: number = 1, time: number = this.dayStartTime): number {
        const newDate = this.currentDate + delta;
        this.currentDate = newDate;
        this.currentTime = time;
        return this.currentDate;
    }

    nowIsBetween(fromTime: number | undefined, toTime: number | undefined): boolean {
        if (fromTime === undefined) {
            fromTime = this.dayStartTime - 1;
        }
        if (toTime === undefined) {
            toTime = this.dayEndTime + 1;
        }
        const currentTime = this.currentTime;
        if (fromTime < toTime) {
            return currentTime >= fromTime && currentTime < toTime;
        }
        return currentTime >= fromTime || currentTime < toTime;
    }
}
