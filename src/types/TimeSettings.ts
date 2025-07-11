import { timeTracker } from "../managers";

export type TimeSlotInterface = {
    name: string;
    startTime: number;
};

/**
 * Time Settings, which can be set using {@link timeTracker.editSettings}
 */
export type TimeSettings = {
    /**
     * Minimum time of the day
     * @default 0
     */
    dayStartTime?: number;
    /**
     * Maximum time of the day
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
     *   { name: 'Morning', startTime: 5 },
     *   { name: 'Afternoon', startTime: 12 },
     *   { name: 'Evening', startTime: 18 },
     *   { name: 'Night', startTime: 22 }
     * ]
     */
    timeSlots?: TimeSlotInterface[];
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
    getDayName?: (weekDayNumber: number) => string;
};
