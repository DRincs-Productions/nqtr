import { StoredClassModel } from "@drincs/pixi-vn";
import { ActivityInterface } from "../../interface";

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
             * the activity will be associated with this class only for the specified hours.
             * If you set from 3 and to 5, the activity will be associated with this class only for hours 3, 4 and 5. soSo at 2 or 6 it will not be associated with this class.
             */
            hours?: {
                from: number;
                to: number;
            };
            /**
             * the activity will be associated with this class from the specified day.
             * If you set 3, the activity will be associated with this class from day 3. So at day 2 it will not be associated with this class.
             */
            fromDay?: number;
            /**
             * the activity will be associated with this class to the specified day.
             * If you set 3, the activity will be associated with this class until day 3. So at day 4 it will not be associated with this class.
             */
            toDay?: number;
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
