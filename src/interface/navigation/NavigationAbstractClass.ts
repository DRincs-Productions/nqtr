import { StoredClassModel } from "@drincs/pixi-vn/storage";
import { ActiveScheduling, ActivityInterface } from "../../interface";

export default interface NavigationAbstractInterface extends StoredClassModel {
    /**
     * Connects the activity to the class.
     * @param activity The activity to connect to the class.
     * @param options
     * @returns
     */
    addActivity(activity: ActivityInterface, options?: ActiveScheduling): void;
    /**
     * Disconnects the activity from the class.
     * @param activity The activity to disconnect from the class.
     * @param options
     */
    removeActivity(activity: ActivityInterface | string): void;
    /**
     * Removes the useless activities.
     */
    clearExpiredActivities(): void;
    /**
     * All the ids of the activities associated with this class. Compared to {@link activities}, they are not filtered based on their scheduling.
     */
    readonly activitiesIds: string[];
    /**
     * The activities associated with this class, filtered based on their scheduling.
     */
    activities: ActivityInterface[];
}
