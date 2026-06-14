import type ActiveScheduling from "@/interface/activity/ActiveScheduling";
import type { OnRunAsyncFunction } from "@/types";
export default interface ActivityInterface extends ActivityBaseInternalInterface {}

export interface ActivityBaseInternalInterface extends ActiveScheduling {
    /**
     * The id of the activity/commitment.
     */
    readonly id: string;
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
     * Whether the activity/commitment is active, so it will be shown in the routine and can be runned.
     * @param options The options to check if the activity/commitment is active.
     */
    isActive(options?: ActiveScheduling): boolean;
}
