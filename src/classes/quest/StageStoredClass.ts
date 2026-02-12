import { OnRunProps } from "@drincs/nqtr";
import { timeTracker } from "@drincs/nqtr/handlers";
import { StoredClassModel } from "@drincs/pixi-vn/storage";
import { StageInterface } from "../../interface";
import { StageBaseInternalInterface } from "../../interface/quest/StageInterface";
import { OnRunEvent, QuestsRequiredType } from "../../types";

export interface StageStoredClassProps {
    /**
     * The function that will be executed when the stage starts.
     */
    onStart?: OnRunEvent<StageInterface>;
    /**
     * The function that will be executed when the stage ends.
     */
    onEnd?: OnRunEvent<StageInterface>;
    /**
     * The number of day/date required to start the stage.
     * @example If the value is 3, and the previous stage ends on day 1, the stage will start on day 4.
     */
    deltaDateRequired?: number;
    /**
     * The quests required to start the stage.
     * @default []
     */
    questsRequired?: QuestsRequiredType[];
}

const STAGE_CATEGORY = "__nqtr-stage__";
export default class StageStoredClass extends StoredClassModel implements StageBaseInternalInterface {
    constructor(id: string, props: StageStoredClassProps = {}) {
        super(STAGE_CATEGORY, id);
        this._onStart = props.onStart;
        this._onEnd = props.onEnd;
        this._deltaDateRequired = props.deltaDateRequired;
        this._questsRequired = props.questsRequired || [];
    }

    private _onStart?: OnRunEvent<StageInterface>;
    get onStart(): undefined | OnRunEvent<StageInterface> {
        return this._onStart;
    }

    private _onEnd?: OnRunEvent<StageInterface>;
    get onEnd(): undefined | OnRunEvent<StageInterface> {
        return this._onEnd;
    }

    get completed(): boolean {
        return this.getStorageProperty<boolean>("completed") || false;
    }
    set completed(value: boolean) {
        this.setStorageProperty("completed", value);
    }

    get started(): boolean {
        return this.getStorageProperty<boolean>("started") || false;
    }
    set started(value: boolean) {
        this.setStorageProperty("started", value);
    }

    private get inizializeDate(): number | undefined {
        return this.getStorageProperty<number>("inizializeDate");
    }
    private set inizializeDate(value: number | undefined) {
        this.setStorageProperty("inizializeDate", value);
    }

    get startDate(): number | undefined {
        let inizializeDate = this.inizializeDate;
        if (inizializeDate === undefined) {
            return undefined;
        }
        return inizializeDate + this.deltaDateRequired;
    }

    get canStart(): boolean {
        let deltaDateRequired = this.deltaDateRequired;
        if (deltaDateRequired > 0) {
            let inizializeDate = this.inizializeDate;
            if (inizializeDate === undefined) {
                return false;
            }
            if (inizializeDate + deltaDateRequired > timeTracker.currentDate) {
                return false;
            }
        }
        if (
            this.questsRequired.length > 0 &&
            !this.questsRequired.every((q) => q.quest.currentStageIndex && q.quest.currentStageIndex >= q.stageNumber)
        ) {
            return false;
        }
        return true;
    }

    inizialize() {
        if (this.deltaDateRequired > 0) {
            this.inizializeDate = timeTracker.currentDate;
            console.log(`[NQTR] Stage ${this.id} will start on date ${this.startDate}`);
        }
    }

    async start(props: OnRunProps) {
        if (this.canStart) {
            this.started = true;
            if (this.onStart) {
                await this.onStart(this as any as StageInterface, props);
            }
        } else {
            console.warn(`[NQTR] Stage ${this.id} can't start`);
        }
    }

    private _deltaDateRequired?: number;
    get deltaDateRequired(): number {
        return this._deltaDateRequired || 0;
    }

    private _questsRequired: QuestsRequiredType[];
    get questsRequired(): QuestsRequiredType[] {
        return this._questsRequired || [];
    }
}
