import type { ActiveScheduling, ActivityInterface } from "@/interface";
import type { ActivityBaseInternalInterface } from "@/interface/activity/ActivityInterface";
import type DateSchedulingInterface from "@/interface/DateSchedulingInterface";
import type TimeSchedulingInterface from "@/interface/TimeSchedulingInterface";
import type { OnRunAsyncFunction, OnRunEvent } from "@/types";
import { timeTracker } from "@drincs/nqtr/handlers";
import { narration } from "@drincs/pixi-vn/narration";
import { StoredClassModel } from "@drincs/pixi-vn/storage";

export interface ActivityStoredClassProps extends ActiveScheduling {}

const ACTIVITY_CATEGORY = "__nqtr-activity__";
export default class ActivityStoredClass<OnRunEventType = ActivityInterface>
    extends StoredClassModel
    implements ActivityBaseInternalInterface
{
    constructor(
        id: string,
        private readonly _onRun: OnRunEvent<OnRunEventType>,
        props: ActivityStoredClassProps,
        category: string = ACTIVITY_CATEGORY,
    ) {
        super(category, id);
        this._timeSlot = props.timeSlot;
        this._dateScheduling = props.dateScheduling;
    }

    private _timeSlot?: TimeSchedulingInterface[] | TimeSchedulingInterface;
    get timeSlot(): TimeSchedulingInterface[] | TimeSchedulingInterface | undefined {
        return this._timeSlot;
    }

    private _dateScheduling?: DateSchedulingInterface;
    get dateScheduling(): DateSchedulingInterface | undefined {
        return this._dateScheduling;
    }

    protected addTempHistoryItem() {
        return narration.addCurrentStepToHistory();
    }
    get run(): OnRunAsyncFunction {
        return async (props) => {
            this.addTempHistoryItem();
            return await this._onRun(this as any, props);
        };
    }

    get expired(): boolean {
        if (this.dateScheduling?.to && this.dateScheduling.to <= timeTracker.currentDate) {
            return true;
        }
        return false;
    }

    isActive(options: ActiveScheduling = {}): boolean {
        let { timeSlot = this.timeSlot, dateScheduling = this.dateScheduling } = options;
        if (dateScheduling?.from != undefined && dateScheduling.from > timeTracker.currentDate) {
            return false;
        }
        if (dateScheduling?.to != undefined && dateScheduling.to < timeTracker.currentDate) {
            return false;
        }
        if (timeSlot && !Array.isArray(timeSlot)) {
            timeSlot = [timeSlot];
        }
        for (const slot of timeSlot || []) {
            if (!timeTracker.nowIsBetween(slot?.from, slot?.to)) {
                return false;
            }
        }
        return true;
    }
}
