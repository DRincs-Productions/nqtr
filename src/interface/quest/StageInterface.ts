import { OnStartEndStageQuest, StageInterface as OverrideStageInterface } from "@drincs/nqtr/dist/override";
import { StageInterface as StageInterfaceInt } from "..";
import { QuestsRequiredType } from "../../types";

export default interface StageInterface extends StageBaseInternalInterface, OverrideStageInterface {}

export interface StageBaseInternalInterface {
    /**
     * The id of the stage.
     */
    readonly id: string;
    /**
     * The function that will be called when the stage starts.
     */
    readonly onStart?: (stage: StageInterfaceInt, props: OnStartEndStageQuest) => void;

    /**
     * The function that will be called when the stage ends.
     */
    readonly onEnd?: (stage: StageInterfaceInt, props: OnStartEndStageQuest) => void;

    /**
     * Check if the flag and goals are completed.
     * You can force the completion of the stage by setting the completed property to true.
     * @example
     * ```ts
     * export default class Stage extends StageStoredClass {
     * 	override get completed(): boolean {
     * 		if (super.completed) {
     * 			return true;
     * 		}
     * 		if (this.flags.length > 0) {
     * 			if (!this.flags.every((flag) => getFlag(flag.flag))) {
     * 				return false;
     * 			}
     * 			return true;
     * 		}
     * 		return false;
     * 	}
     * 	override set completed(value: boolean) {
     * 		super.completed = value;
     * 	}
     * }
     * ```
     */
    completed: boolean;

    /**
     * If the stage is started.
     */
    started: boolean;

    /**
     * The day when the stage starts.
     */
    readonly startDay?: number;

    /**
     * Check if the stage can start.
     * @example
     * ```ts
     * export default class Stage extends StageStoredClass {
     * 	override get canStart(): boolean {
     * 		if (this.flagsRequiredToStart.length > 0 && !this.flagsRequiredToStart.every((flag) => getFlag(flag.flag))) {
     * 			return false;
     * 		}
     * 		return super.canStart;
     * 	}
     * }
     * ```
     */
    readonly canStart: boolean;

    /**
     * The function that will be called when the stage starts.
     */
    start(props: OnStartEndStageQuest): void;

    /**
     * The number of days required to start the stage.
     */
    readonly daysRequiredToStart: number;

    /**
     * The list of quests required to start the stage.
     */
    readonly questsRequiredToStart: QuestsRequiredType[];
}
