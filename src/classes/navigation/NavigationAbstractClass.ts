import { StoredClassModel } from "@drincs/pixi-vn";
import { RegisteredActivities } from "../../decorators";
import { ActivityInterface } from "../../interface";
import NavigationAbstractInterface from "../../interface/navigation/NavigationAbstractClass";
import { timeTracker } from "../../managers";

type ActiveScheduling = {
    fromHour?: number;
    toHour?: number;
    fromDay?: number;
    toDay?: number;
};
type ExcludedScheduling = {
    toDay?: number;
};

export default abstract class NavigationAbstractClass extends StoredClassModel implements NavigationAbstractInterface {
    constructor(categoryId: string, id: string, private defaultActivities: ActivityInterface[] = []) {
        super(categoryId, id);
    }
    private get defaultActivitiesIds(): string[] {
        return this.defaultActivities.map((activity) => activity.id);
    }
    private get activeActivityScheduling(): { [activityId: string]: ActiveScheduling } {
        return this.getStorageProperty<{ [activityId: string]: ActiveScheduling }>(`activeActivityScheduling`) || {};
    }
    private get excludedActivitiesScheduling(): { [activityId: string]: ExcludedScheduling } {
        return (
            this.getStorageProperty<{ [activityId: string]: ExcludedScheduling }>(`excludedActivitiesScheduling`) || {}
        );
    }
    private removeActivityScheduling(activityId: string) {
        let activeActivityScheduling = this.activeActivityScheduling;
        delete activeActivityScheduling[activityId];
        this.setStorageProperty(`activeActivityScheduling`, activeActivityScheduling);
        let excludedActivitiesScheduling = this.excludedActivitiesScheduling;
        delete excludedActivitiesScheduling[activityId];
        this.setStorageProperty(`excludedActivitiesScheduling`, excludedActivitiesScheduling);
    }
    private editActivityScheduling(activityId: string, scheduling: ActiveScheduling) {
        this.removeActivityScheduling(activityId);
        let activeActivityScheduling = this.activeActivityScheduling;
        activeActivityScheduling[activityId] = scheduling;
        this.setStorageProperty(`activeActivityScheduling`, activeActivityScheduling);
    }
    private editExcludedActivityScheduling(activityId: string, scheduling: ExcludedScheduling) {
        this.removeActivityScheduling(activityId);
        let excludedActivitiesScheduling = this.excludedActivitiesScheduling;
        excludedActivitiesScheduling[activityId] = scheduling;
        this.setStorageProperty(`excludedActivitiesScheduling`, excludedActivitiesScheduling);
    }
    private get additionalActivitiesIds(): string[] {
        return this.getStorageProperty<string[]>(`additionalActivitiesIds`) || [];
    }
    private get excludedActivitiesIds(): string[] {
        return this.getStorageProperty<string[]>(`excludedActivitiesIds`) || [];
    }
    addActivity(
        activity: ActivityInterface,
        options: {
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
        } = {}
    ) {
        const { hours, fromDay, toDay } = options;
        let scheduling: ActiveScheduling = {};
        if (hours) {
            if (hours.from >= hours.to) {
                throw new Error(`[NQTR] The from hour must be less than the to hour.`);
            }
            scheduling.fromHour = hours.from;
        }
        if (fromDay === 0) {
            console.warn(`[NQTR] The from day must be greater than 0, so it will be ignored.`);
        }
        if (toDay === 0) {
            console.warn(`[NQTR] The to day must be greater than 0, so it will be ignored.`);
        }
        if (fromDay && toDay && fromDay >= toDay) {
            throw new Error(`[NQTR] The from day must be less than the to day.`);
        }
        if (fromDay) {
            scheduling.fromDay = fromDay;
        }
        if (toDay) {
            scheduling.toDay = toDay;
        }

        if (this.defaultActivitiesIds.includes(activity.id)) {
            console.warn(`[NQTR] Activity with id ${activity.id} already exists, so it will be ignored.`);
            return;
        }
        let additionalActivitiesIds = this.additionalActivitiesIds;
        if (additionalActivitiesIds.includes(activity.id)) {
            if (Object.keys(scheduling).length) {
                this.editActivityScheduling(activity.id, scheduling);
                return;
            } else if (this.excludedActivitiesIds.includes(activity.id)) {
                this.removeActivityScheduling(activity.id);
                console.log(
                    `[NQTR] Activity with id ${activity.id} was excluded, so it will be associated with this class again.`
                );
                return;
            }
            console.warn(`[NQTR] Activity with id ${activity.id} already exists, so it will be ignored.`);
            return;
        }
        additionalActivitiesIds.push(activity.id);
        this.setStorageProperty(`additionalActivitiesIds`, additionalActivitiesIds);
        if (Object.keys(scheduling).length) {
            this.editActivityScheduling(activity.id, scheduling);
        }
    }
    removeActivity(
        activity: ActivityInterface,
        options: {
            /**
             * The activity will be excluded from this class only for the specified days.
             * If to 3, the activity will be excluded from this class only for days 1, 2 and 3. So at day 4 it will be associated with this class.
             */
            toDay?: number;
        } = {}
    ) {
        const { toDay } = options;
        let scheduling: ExcludedScheduling = {};
        if (toDay === 0) {
            console.warn(`[NQTR] The to day must be greater than 0, so it will be ignored.`);
        }
        if (toDay) {
            scheduling.toDay = toDay;
        }

        let additionalActivitiesIds = this.additionalActivitiesIds;
        if (additionalActivitiesIds.includes(activity.id)) {
            if (Object.keys(scheduling).length) {
                this.editExcludedActivityScheduling(activity.id, scheduling);
                return;
            }
            additionalActivitiesIds = additionalActivitiesIds.filter((id) => id !== activity.id);
            this.setStorageProperty(`additionalActivitiesIds`, additionalActivitiesIds);
        } else if (this.defaultActivitiesIds.includes(activity.id)) {
            if (Object.keys(scheduling).length) {
                this.editExcludedActivityScheduling(activity.id, scheduling);
                return;
            }
            let excludedActivitiesIds = this.excludedActivitiesIds;
            excludedActivitiesIds.push(activity.id);
            this.setStorageProperty(`excludedActivitiesIds`, excludedActivitiesIds);
        } else {
            console.warn(`[NQTR] Activity with id ${activity.id} not found, so it will be ignored.`);
        }
    }
    clearExpiredActivities() {
        let activeActivityScheduling = this.activeActivityScheduling;
        let excludedActivitiesScheduling = this.excludedActivitiesScheduling;
        let additionalActivitiesIds = this.additionalActivitiesIds;
        let excludedActivitiesIds = this.excludedActivitiesIds;

        additionalActivitiesIds.forEach((activityId) => {
            if (activityId in activeActivityScheduling) {
                let { toDay } = activeActivityScheduling[activityId];
                if (toDay && toDay < timeTracker.currentDay) {
                    this.removeActivityScheduling(activityId);
                    additionalActivitiesIds = additionalActivitiesIds.filter((id) => id !== activityId);
                }
            }
        });
        excludedActivitiesIds.forEach((activityId) => {
            if (activityId in excludedActivitiesScheduling) {
                let { toDay } = excludedActivitiesScheduling[activityId];
                if (toDay && toDay < timeTracker.currentDay) {
                    this.removeActivityScheduling(activityId);
                    excludedActivitiesIds = excludedActivitiesIds.filter((id) => id !== activityId);
                }
            }
        });
    }

    get activities(): ActivityInterface[] {
        let res: ActivityInterface[] = [];
        Object.entries(this.activeActivityScheduling).forEach(([activityId, scheduling]) => {
            let activity = RegisteredActivities.get(activityId);
            const {
                fromDay = activity?.fromDay,
                fromHour = activity?.fromHour,
                toDay = activity?.toDay,
                toHour = activity?.toHour,
            } = scheduling;
            if (
                activity &&
                timeTracker.nowIsBetween(fromHour, toHour) &&
                !(fromDay && fromDay > timeTracker.currentDay) &&
                !(toDay && toDay < timeTracker.currentDay)
            ) {
                res.push(activity);
            }
        });
        Object.entries(this.excludedActivitiesScheduling).forEach(([activityId, scheduling]) => {
            let activity = RegisteredActivities.get(activityId);
            if (activity && activity.isActive && !(scheduling.toDay && scheduling.toDay >= timeTracker.currentDay)) {
                res.push(activity);
            }
        });
        this.defaultActivities.forEach((activity) => {
            if (activity.isActive && !res.find((a) => a.id === activity.id)) {
                res.push(activity);
            }
        });
        return res;
    }
}
