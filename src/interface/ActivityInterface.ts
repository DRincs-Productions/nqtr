import { ActivityInterface as OverrideActivityInterface } from "@drincs/nqtr";
import { OnRunAsyncFunction } from "../types";
import DateSchedulingInterface from "./DateSchedulingInterface";
import TimeSchedulingInterface from "./TimeSchedulingInterface";

export default interface ActivityInterface extends ActivityBaseInternalInterface, OverrideActivityInterface {}

export interface ActivityBaseInternalInterface {
    /**
     * The id of the activity/commitment.
     */
    readonly id: string;
    /**
     * Time slot in which activity/commitment will be active.
     */
    readonly timeSlot: TimeSchedulingInterface | undefined;
    /**
     * Used to schedule what date it will be added and removed.
     */
    readonly dateScheduling: DateSchedulingInterface | undefined;
    /**
     * The function that is called when the activity/commitment is runned.
     */
    readonly run: OnRunAsyncFunction;
    /**
     * Whether the activity/commitment is a deadline, so it will then be removed or hidden.
     *
     * It **depends only on the date**, not the time. So if you set { dateScheduling: { from: 0, to: 3 }, timeSlot { from: 10, to: 20 } } the activity/commitment hidden or deleted on date 3 at 0.
     */
    readonly expired: boolean;
    /**
     * Whether the activity/commitment is active.
     */
    readonly isActive: boolean;
}
