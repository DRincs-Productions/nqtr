import { timeTracker } from "@drincs/nqtr/handlers";
import { RegisteredActivities } from "@drincs/nqtr/registries";
import { PixiError } from "@drincs/pixi-vn/core";
import { StoredClassModel } from "@drincs/pixi-vn/storage";
import { ActiveScheduling, ActivityInterface } from "../../interface";
import { ExcludedScheduling } from "../../interface/activity/ActiveScheduling";
import NavigationAbstractInterface from "../../interface/navigation/NavigationAbstractClass";
import { logger } from "../../utils/log-utility";

export default abstract class NavigationAbstractClass extends StoredClassModel implements NavigationAbstractInterface {
    constructor(
        categoryId: string,
        id: string,
        private defaultActivities: ActivityInterface[] = [],
    ) {
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
    get activitiesIds(): string[] {
        return this.additionalActivitiesIds.concat(this.defaultActivitiesIds);
    }
    addActivity(activity: ActivityInterface, options: ActiveScheduling = {}) {
        let { timeSlot, dateScheduling } = options;
        if (timeSlot && !Array.isArray(timeSlot)) {
            timeSlot = [timeSlot];
        }
        timeSlot?.forEach((timeSlot) => {
            const { to: toTime = timeTracker.dayEndTime + 1 } = timeSlot || {};
            if (timeSlot) {
                if (timeSlot.from >= toTime) {
                    logger.error(`The from time must be less than the to time.`);
                    throw new PixiError("invalid_usage", `The from time must be less than the to time.`);
                }
            }
        });
        if (
            dateScheduling?.from !== undefined &&
            dateScheduling?.to !== undefined &&
            dateScheduling?.from >= dateScheduling?.to
        ) {
            logger.error(`The from day/date must be less than the to day/date.`);
            throw new PixiError("invalid_usage", `The from day/date must be less than the to day/date.`);
        }

        let additionalActivitiesIds = this.additionalActivitiesIds;
        if (this.defaultActivitiesIds.includes(activity.id) || additionalActivitiesIds.includes(activity.id)) {
            logger.info(
                `Activity with id ${activity.id} already exists in the ${this.id}, so it will be updated with the new scheduling options if they are provided.`,
            );
        } else {
            additionalActivitiesIds.push(activity.id);
        }

        if (this.excludedActivitiesIds.includes(activity.id)) {
            this.removeActivityScheduling(activity.id);
            logger.log(
                `Activity with id ${activity.id} was excluded from the ${this.id}, but now it will be added again with the new scheduling options. So it will be removed from the excluded activities list.`,
            );
        }

        if (timeSlot || dateScheduling) {
            this.editActivityScheduling(activity.id, {
                timeSlot: timeSlot,
                dateScheduling: dateScheduling,
            });
        }
    }
    removeActivity(activity: ActivityInterface | string) {
        const activityId = typeof activity === "string" ? activity : activity.id;

        let additionalActivitiesIds = this.additionalActivitiesIds;
        if (additionalActivitiesIds.includes(activityId)) {
            additionalActivitiesIds = additionalActivitiesIds.filter((id) => id !== activityId);
            this.setStorageProperty(`additionalActivitiesIds`, additionalActivitiesIds);
        } else if (this.defaultActivitiesIds.includes(activityId)) {
            let excludedActivitiesIds = this.excludedActivitiesIds;
            excludedActivitiesIds.push(activityId);
            this.setStorageProperty(`excludedActivitiesIds`, excludedActivitiesIds);
        } else {
            logger.warn(`Activity with id ${activityId} not found, so it will be ignored.`);
        }
    }
    clearExpiredActivities() {
        let activeActivityScheduling = this.activeActivityScheduling;
        let excludedActivitiesScheduling = this.excludedActivitiesScheduling;
        let additionalActivitiesIds = this.additionalActivitiesIds;
        let excludedActivitiesIds = this.excludedActivitiesIds;

        additionalActivitiesIds.forEach((activityId) => {
            if (activityId in activeActivityScheduling) {
                let { to: toDate } = activeActivityScheduling[activityId].dateScheduling || {};
                if (toDate && toDate < timeTracker.currentDate) {
                    this.removeActivityScheduling(activityId);
                    additionalActivitiesIds = additionalActivitiesIds.filter((id) => id !== activityId);
                }
            }
        });
        excludedActivitiesIds.forEach((activityId) => {
            if (activityId in excludedActivitiesScheduling) {
                if (excludedActivitiesScheduling[activityId]) {
                    this.removeActivityScheduling(activityId);
                    excludedActivitiesIds = excludedActivitiesIds.filter((id) => id !== activityId);
                }
            }
        });
    }

    get activities(): ActivityInterface[] {
        return [...new Set<string>([...this.additionalActivitiesIds, ...this.defaultActivitiesIds])].reduce(
            (acc: ActivityInterface[], activityId) => {
                const activity = RegisteredActivities.get(activityId);
                if (
                    activity &&
                    activity.isActive(this.activeActivityScheduling[activityId]) &&
                    !this.excludedActivitiesScheduling[activityId]
                ) {
                    acc.push(activity);
                }
                return acc;
            },
            [],
        );
    }
}
