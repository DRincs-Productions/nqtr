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
    removeActivity(activity: ActivityInterface | string, options?: Pick<DateSchedulingInterface, "to">): void;
    /**
     * Removes the useless activities.
     */
    clearExpiredActivities(): void;
    /**
     * All the ids of the activities associated with this class. Compared to {@link activities}, they are not filtered based on their scheduling.
     */
    activitiesIds: string[];
    /**
     * The activities associated with this class, filtered based on their scheduling.
     */
    activities: ActivityInterface[];
}
