import { OnRunProps } from "@drincs/nqtr";
import { StoredClassModel } from "@drincs/pixi-vn";
import { QuestInterface, StageInterface } from "../../interface";
import { QuestBaseInternalInterface } from "../../interface/quest/QuestInterface";
import StageStoredClass from "./StageStoredClass";

const QUEST_CATEGORY = "__nqtr-quest__";
export default class QuestStoredClass extends StoredClassModel implements QuestBaseInternalInterface {
    constructor(
        id: string,
        private readonly _stages: StageInterface[],
        props: {
            /**
             * The function that will be executed when the quest starts.
             */
            onStart?: (stage: QuestInterface, props: OnRunProps) => void;
            /**
             * The function that will be executed when a stage end in the quest.
             */
            onNextStage?: (stage: QuestInterface, props: OnRunProps) => void;
        } = {}
    ) {
        super(QUEST_CATEGORY, id);
        this._onStart = props.onStart;
        this._onNextStage = props.onNextStage;
    }

    get stages(): StageInterface[] {
        return this._stages;
    }

    get currentStageIndex(): number | undefined {
        return this.getStorageProperty<number>("currentStageIndex");
    }
    private set currentStageIndex(value: number | undefined) {
        this.setStorageProperty("currentStageIndex", value);
    }

    get currentStage(): StageInterface | undefined {
        let index = this.currentStageIndex;
        if (index === undefined || index >= this.stages.length) {
            return undefined;
        }
        return this.stages[index];
    }

    get started(): boolean {
        return this.currentStageIndex !== undefined;
    }

    get completed(): boolean {
        if (this.currentStageIndex === undefined) {
            return false;
        }
        return this.currentStageIndex > this.stages.length - 1;
    }

    get inProgress() {
        if (this.completed) {
            return false;
        }
        if (this.failed) {
            return false;
        }
        return this.started;
    }

    get failed(): boolean {
        return this.getStorageProperty<boolean>("failed") || false;
    }
    set failed(value: boolean) {
        this.setStorageProperty("failed", value);
    }

    private _onStart?: (stage: QuestInterface, props: OnRunProps) => void;
    get onStart(): undefined | ((stage: QuestInterface, props: OnRunProps) => void) {
        return this._onStart;
    }

    private _onNextStage?: (stage: QuestInterface, props: OnRunProps) => void;
    get onNextStage(): undefined | ((stage: QuestInterface, props: OnRunProps) => void) {
        return this._onNextStage;
    }

    start(props: OnRunProps): void {
        if (this.started) {
            console.warn(`[NQTR] Quest ${this.id} is already started`);
            return;
        }
        if (this.stages.length === 0) {
            console.error(`[NQTR] Quest ${this.id} has no stages`);
            return;
        }
        this.currentStageIndex = 0;
        let currentStage = this.currentStage;
        if (currentStage && currentStage.start) {
            this.onStart && this.onStart(this as any as QuestInterface, props);
            return currentStage.start(props);
        } else {
            console.error(`[NQTR] Quest ${this.id} has no start stage`);
        }
    }

    tryToGoNextStage(props: OnRunProps): boolean {
        if (!this.inProgress) {
            return false;
        }
        let currentStage = this.currentStage;
        if (!currentStage) {
            console.error(`[NQTR] Quest ${this.id} has no current stage`);
            return false;
        }
        if (currentStage.completed) {
            return this.goNextStage(props);
        }
        return false;
    }

    completeCurrentStageAndGoNext(props: OnRunProps): boolean {
        let currentStage = this.currentStage;
        if (!currentStage) {
            console.error(`[NQTR] Quest ${this.id} has no current stage`);
            return false;
        }
        currentStage.completed = true;
        return this.goNextStage(props);
    }

    goNextStage(props: OnRunProps): boolean {
        if (!this.inProgress) {
            console.warn(`[NQTR] Quest ${this.id} is not in progress`);
            return false;
        }
        let prevStage = this.currentStage;
        let currentStageIndex = this.currentStageIndex;
        if (!prevStage || currentStageIndex === undefined) {
            console.error(`[NQTR] Quest ${this.id} has no current stage`);
            return false;
        }
        this.currentStageIndex = currentStageIndex + 1;
        this.onNextStage && this.onNextStage(this as any as QuestInterface, props);
        if (prevStage && prevStage.onEnd) {
            prevStage.onEnd(prevStage, props);
        }
        let nextCurrentStage = this.currentStage;
        if (nextCurrentStage) {
            (nextCurrentStage as any as StageStoredClass).inizialize();
            if (this.currentStageMustStart) {
                this.startCurrentStage(props);
            }
        }

        return true;
    }

    get currentStageMustStart(): boolean {
        let currentStage = this.currentStage;
        if (!currentStage) {
            return false;
        }
        return !currentStage.started && currentStage.canStart && !currentStage.completed;
    }

    startCurrentStage(props: OnRunProps): void {
        let newCurrentStage = this.currentStage;
        if (newCurrentStage && this.currentStageMustStart) {
            newCurrentStage.start(props);
        } else {
            console.warn(`[NQTR] Quest ${this.id} can't start the current stage`);
        }
    }
}
