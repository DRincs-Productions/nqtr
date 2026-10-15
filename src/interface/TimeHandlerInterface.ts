import type { TimeSettings, TimeSlotInterface } from "@/types/TimeSettings";

/**
 * Handler that manages the time of the game: the current time and date, the day/week structure
 * and the time slots.
 */
export default interface TimeHandlerInterface {
    /**
     * Set the time settings. Omitted values fall back to their defaults.
     * @param settings The time settings.
     */
    initialize(settings: TimeSettings): void;
    /**
     * The time at which a day starts.
     */
    readonly dayStartTime: number;
    /**
     * The time at which a day ends. When the time reaches it, the date increases.
     */
    readonly dayEndTime: number;
    /**
     * The default time spent by {@link increaseTime} when no delta is given.
     */
    readonly defaultTimeSpent: number;
    /**
     * The time slots of a day (e.g. morning, afternoon, evening).
     */
    readonly timeSlots: TimeSlotInterface[];
    /**
     * The number of days in a week.
     */
    readonly weekLength: number;
    /**
     * The week day (starting from 0) from which the weekend starts.
     */
    readonly weekendStartDay: number;
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
    readonly getDayName: ((weekDayNumber: number) => string) | undefined;
    /**
     * The current time. Time is a numeric variable used to determine and manage time during a day/date.
     * It's recommended to use currentTime as if it were the current time. If you also want to manage minutes, you can use a float value.
     * Setting it to `undefined` resets it to {@link dayStartTime}.
     */
    get currentTime(): number;
    set currentTime(value: number | undefined);
    /**
     * The current date. Date is a numeric variable used to determine and manage the number of days passed.
     * It's recommended to use currentDate as if it were the current day.
     * Setting it to `undefined` resets it to 0.
     */
    get currentDate(): number;
    set currentDate(value: number | undefined);
    /**
     * If the current day is greater than or equal to the weekend start day, then it will return true.
     */
    readonly isWeekend: boolean;
    /**
     * The current week day number (from: 1 - to: {@link weekLength}).
     * For example, if the week length is 7 and the current day is 10, then the result will be 4.
     */
    readonly currentWeekDayNumber: number;
    /**
     * The current week day name. If the week days names are not defined, then it will return an empty string.
     * For example, if the week days names are ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] and the current day is 10, then the result will be 'Thursday'.
     * @default ""
     */
    readonly currentDayName: string;
    /**
     * The index of the current time slot in {@link timeSlots}.
     * You can use this property to create "Image that changes based on the time period":
     * @example
     * ```tsx
     * import { timeTracker } from '@drincs/nqtr';
     *
     * function changeBackground() {
     *     return (
     *         <img src={`background-${timeTracker.currentTimeSlot}.png`} />
     *     )
     * }
     * ```
     */
    readonly currentTimeSlot: number;
    /**
     * Increase the current time by the given time spent.
     * If the new time is greater than or equal to {@link dayEndTime}, then it will increase the day and set the new time.
     * @param delta The time spent (default: {@link defaultTimeSpent}).
     * @returns The new current time.
     */
    increaseTime(delta?: number): number;
    /**
     * Increase the current date by the given delta.
     * @param delta The number of days to increase (default: 1).
     * @param time The time of the new day (default: {@link dayStartTime}).
     * @returns The new current date.
     */
    increaseDate(delta?: number, time?: number): number;
    /**
     * Check if the current time is between the given times.
     * @param fromTime The starting time. If the {@link currentTime} is equal to this time, the function will return true. If undefined, the day start is used.
     * @param toTime The ending time. If undefined, the day end is used.
     * @returns true if the current time is between the given times, otherwise false.
     */
    nowIsBetween(fromTime: number | undefined, toTime: number | undefined): boolean;
}
