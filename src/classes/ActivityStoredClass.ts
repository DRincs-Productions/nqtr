import { StoredClassModel } from "@drincs/pixi-vn";
import { addTempHistoryItem } from "../functions/tracking-changes";
import { ActivityInterface } from "../interface";
import { ActivityBaseInternalInterface } from "../interface/ActivityInterface";
import { timeTracker } from "../managers";
import { OnRunAsyncFunction, OnRunEvent } from "../types";

const ACTIVITY_CATEGORY = "__nqtr-activity__";
export default class ActivityStoredClass<OnRunEventType = ActivityInterface>
    extends StoredClassModel
    implements ActivityBaseInternalInterface
{
    constructor(
        id: string,
        private readonly _onRun: OnRunEvent<OnRunEventType>,
        props: {
            fromHour?: number;
            toHour?: number;
            fromDay?: number;
            toDay?: number;
        },
        category: string = ACTIVITY_CATEGORY
    ) {
        super(category, id);
        this._fromHour = props.fromHour;
        this._toHour = props.toHour;
        this._fromDay = props.fromDay;
        this._toDay = props.toDay;
    }

    private _fromHour?: number;
    get fromHour(): number | undefined {
        return this._fromHour;
    }

    private _toHour?: number;
    get toHour(): number | undefined {
        return this._toHour;
    }

    private _fromDay?: number;
    get fromDay(): number | undefined {
        return this._fromDay;
    }

    private _toDay?: number;
    get toDay(): number | undefined {
        return this._toDay;
    }

    get run(): OnRunAsyncFunction {
        return async (props) => {
            addTempHistoryItem();
            return await this._onRun(this as any, props);
        };
    }

    get expired(): boolean {
        if (this.toDay && this.toDay <= timeTracker.currentDay) {
            return true;
        }
        return false;
    }

    get isActive(): boolean {
        if (this.fromDay && this.fromDay > timeTracker.currentDay) {
            return false;
        }
        if (this.toDay && this.toDay < timeTracker.currentDay) {
            return false;
        }
        if (!timeTracker.nowIsBetween(this.fromHour, this.toHour)) {
            return false;
        }
        return true;
    }
}
