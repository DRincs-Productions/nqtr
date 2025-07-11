import { timeTracker } from "../managers";

export type ITimeStlot = {
    name: string;
    startHour: number;
};

/**
 * Time Settings, which can be set using {@link timeTracker.editSettings}
 */
export type TimeSettings = {
    /**
     * Minimum hour of the day
     * @default 0
     */
    dayStartTime?: number;
    /**
     * Maximum hour of the day
     * @default 24
     */
    dayEndTime?: number;
    /**
     * Default time spent
     * @default 1
     */
    defaultTimeSpent?: number;
    /**
     * Time slots
     * @default []
     * @example
     * ```ts
     * [
     *   { name: 'Morning', startHour: 5 },
     *   { name: 'Afternoon', startHour: 12 },
     *   { name: 'Evening', startHour: 18 },
     *   { name: 'Night', startHour: 22 }
     * ]
     */
    timeSlots?: ITimeStlot[];
    /**
     * Week length
     * @default 7
     */
    weekLength?: number;
    /**
     * Weekend start day. For example, if the real life weekend starts on Saturday, then the value should be 6
     * @default weekLength - 1
     */
    weekendStartDay?: number;
    /**
     * Week days name
     * @param weekDayNumber The current week day number (from: 1 - to: {@link weekLength}).
     * @returns The name of the week day.
     * @example
     * ```ts
     * (weekDayNumber: Date) => {
     *     const weekDaysNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
     *     return weekDaysNames[currentWeekDayNumber - 1];
     * }
     * ```
     */
    getDayName?: (weekDayNumber: number) => string;
};
