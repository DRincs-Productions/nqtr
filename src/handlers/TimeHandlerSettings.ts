import type { TimeSettings, TimeSlotInterface } from "../types/TimeSettings";

export default class TimeHandlerSettings implements TimeSettings {
    static dayStartTime: number = 0;
    static dayEndTime: number = 24;
    static defaultTimeSpent: number = 1;
    static timeSlots: TimeSlotInterface[] = [];
    static weekLength: number = 7;
    static weekendStartDay: number = this.weekLength - 1;
    static getDayName?: (weekDayNumber: number) => string;
}
