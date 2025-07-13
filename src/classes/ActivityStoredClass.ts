import { narration, StoredClassModel } from "@drincs/pixi-vn";
import { ActivityInterface } from "../interface";
import { ActivityBaseInternalInterface } from "../interface/ActivityInterface";
import DateSchedulingInterface from "../interface/DateSchedulingInterface";
import TimeSchedulingInterface from "../interface/TimeSchedulingInterface";
import { timeTracker } from "../managers";
import { OnRunAsyncFunction, OnRunEvent } from "../types";

export interface ActivityStoredClassProps {
    /**
     * Time slot in which activity/commitment will be active.
     */
    timeSlot?: TimeSchedulingInterface;
    /**
     * Used to schedule what date it will be added and removed.
     */
    dateScheduling?: DateSchedulingInterface;
}

const ACTIVITY_CATEGORY = "__nqtr-activity__";
export default class ActivityStoredClass<OnRunEventType = ActivityInterface>
    extends StoredClassModel
    implements ActivityBaseInternalInterface
{
    constructor(
        id: string,
        private readonly _onRun: OnRunEvent<OnRunEventType>,
        props: ActivityStoredClassProps,
        category: string = ACTIVITY_CATEGORY
    ) {
        super(category, id);
        this._timeSlot = props.timeSlot;
        this._dateScheduling = props.dateScheduling;
    }

    private _timeSlot?: TimeSchedulingInterface;
    get timeSlot(): TimeSchedulingInterface | undefined {
        return this._timeSlot;
    }

    private _dateScheduling?: DateSchedulingInterface;
    get dateScheduling(): DateSchedulingInterface | undefined {
        return this._dateScheduling;
    }

    protected addTempHistoryItem() {
        narration.addCurrentStepToHistory();
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

    get isActive(): boolean {
        if (this.dateScheduling?.from && this.dateScheduling.from > timeTracker.currentDate) {
            return false;
        }
        if (this.dateScheduling?.to && this.dateScheduling.to < timeTracker.currentDate) {
            return false;
        }
        if (!timeTracker.nowIsBetween(this.timeSlot?.from, this.timeSlot?.to)) {
            return false;
        }
        return true;
    }
}
