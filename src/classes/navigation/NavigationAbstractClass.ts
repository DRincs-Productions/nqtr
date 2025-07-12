import { StoredClassModel } from "@drincs/pixi-vn";
import { RegisteredActivities } from "../../decorators";
import { ActivityInterface } from "../../interface";
import DateSchedulingInterface from "../../interface/DateSchedulingInterface";
import NavigationAbstractInterface from "../../interface/navigation/NavigationAbstractClass";
import TimeSchedulingInterface from "../../interface/TimeSchedulingInterface";
import { timeTracker } from "../../managers";

type ActiveScheduling = {
    timeSlot: Partial<TimeSchedulingInterface>;
    dateScheduling: Partial<DateSchedulingInterface>;
};
type ExcludedScheduling = {
    dateScheduling: Pick<DateSchedulingInterface, "to">;
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
            timeSlot?: TimeSchedulingInterface;
            dateScheduling?: DateSchedulingInterface;
        } = {}
    ) {
        const { timeSlot, dateScheduling } = options;
        const { to: toTime = timeTracker.dayEndTime + 1 } = timeSlot || {};
        let scheduling: ActiveScheduling = {
            timeSlot: {},
            dateScheduling: {},
        };
        if (timeSlot) {
            if (timeSlot.from >= toTime) {
                throw new Error(`[NQTR] The from time must be less than the to time.`);
            }
            scheduling.timeSlot.from = timeSlot.from;
        }
        if (
            dateScheduling?.from !== undefined &&
            dateScheduling?.to !== undefined &&
            dateScheduling?.from >= dateScheduling?.to
        ) {
            throw new Error(`[NQTR] The from day/date must be less than the to day/date.`);
        }
        if (dateScheduling?.from !== undefined) {
            scheduling.dateScheduling.from = dateScheduling?.from;
        }
        if (dateScheduling?.to !== undefined) {
            scheduling.dateScheduling.to = dateScheduling?.to;
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
    removeActivity(activity: ActivityInterface | string, options: Pick<DateSchedulingInterface, "to"> = {}) {
        const { to } = options;
        const activityId = typeof activity === "string" ? activity : activity.id;
        let scheduling: ExcludedScheduling = {
            dateScheduling: {},
        };
        if (to !== undefined) {
            scheduling.dateScheduling.to = to;
        }

        let additionalActivitiesIds = this.additionalActivitiesIds;
        if (additionalActivitiesIds.includes(activityId)) {
            if (Object.keys(scheduling).length) {
                this.editExcludedActivityScheduling(activityId, scheduling);
                return;
            }
            additionalActivitiesIds = additionalActivitiesIds.filter((id) => id !== activityId);
            this.setStorageProperty(`additionalActivitiesIds`, additionalActivitiesIds);
            this.removeActivityScheduling(activityId);
        } else if (this.defaultActivitiesIds.includes(activityId)) {
            if (Object.keys(scheduling).length) {
                this.editExcludedActivityScheduling(activityId, scheduling);
                return;
            }
            let excludedActivitiesIds = this.excludedActivitiesIds;
            excludedActivitiesIds.push(activityId);
            this.setStorageProperty(`excludedActivitiesIds`, excludedActivitiesIds);
        } else {
            console.warn(`[NQTR] Activity with id ${activityId} not found, so it will be ignored.`);
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
                let { to: toDate } = excludedActivitiesScheduling[activityId].dateScheduling || {};
                if (toDate && toDate < timeTracker.currentDate) {
                    this.removeActivityScheduling(activityId);
                    excludedActivitiesIds = excludedActivitiesIds.filter((id) => id !== activityId);
                }
            }
        });
    }

    get activities(): ActivityInterface[] {
        let res: ActivityInterface[] = [];
        let activeActivityScheduling = this.activeActivityScheduling;
        this.additionalActivitiesIds.concat(this.defaultActivitiesIds).forEach((activityId) => {
            let activity = RegisteredActivities.get(activityId);
            const { dateScheduling, timeSlot } = activeActivityScheduling[activityId] || {};
            const { from: fromDate = activity?.dateScheduling?.from, to: toDate = activity?.dateScheduling?.to } =
                dateScheduling || {};
            const { from: fromTime = activity?.timeSlot?.from, to: toTime = activity?.timeSlot?.to } = timeSlot || {};
            if (
                activity &&
                timeTracker.nowIsBetween(fromTime, toTime) &&
                !(fromDate && fromDate > timeTracker.currentDate) &&
                !(toDate && toDate < timeTracker.currentDate)
            ) {
                res.push(activity);
            }
        });
        Object.entries(this.excludedActivitiesScheduling).forEach(([activityId, scheduling]) => {
            let activity = RegisteredActivities.get(activityId);
            if (
                activity &&
                activity.isActive &&
                !(scheduling.dateScheduling.to !== undefined && scheduling.dateScheduling.to >= timeTracker.currentDate)
            ) {
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
