import { StoredClassModel } from "@drincs/pixi-vn";
import { ActivityInterface } from "../../interface";
import DateSchedulingInterface from "../DateSchedulingInterface";
import TimeSchedulingInterface from "../TimeSchedulingInterface";

export default interface NavigationAbstractInterface extends StoredClassModel {
    /**
     * Connects the activity to the class.
     * @param activity The activity to connect to the class.
     * @param options
     * @returns
     */
    addActivity(
        activity: ActivityInterface,
        options?: {
            /**
             * Time slot in which activity will be active.
             */
            timeSlot?: TimeSchedulingInterface;
            /**
             * Used to schedule what date it will be added and removed.
             */
            dateScheduling?: DateSchedulingInterface;
        }
    ): void;
    /**
     * Disconnects the activity from the class.
     * @param activity The activity to disconnect from the class.
     * @param options
     */
    removeActivity(
        activity: ActivityInterface | string,
        options?: {
            /**
             * The activity will be excluded from this class only for the specified days.
             * If to 3, the activity will be excluded from this class only for days 1, 2 and 3. So at day 4 it will be associated with this class.
             */
            toDay?: number;
        }
    ): void;
    /**
     * Removes the useless activities.
     */
    clearExpiredActivities(): void;
    /**
     * The activities associated with this class.
     */
    activities: ActivityInterface[];
}
