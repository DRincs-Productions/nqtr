import { OnRunProps, StageInterface as OverrideStageInterface } from "@drincs/nqtr";
import { StageInterface as StageInterfaceInt } from "..";
import { OnRunEvent, QuestsRequiredType } from "../../types";

export default interface StageInterface extends StageBaseInternalInterface, OverrideStageInterface {}

export interface StageBaseInternalInterface {
    /**
     * The id of the stage.
     */
    readonly id: string;
    /**
     * The function that will be called when the stage starts.
     */
    readonly onStart?: OnRunEvent<StageInterfaceInt>;

    /**
     * The function that will be called when the stage ends.
     */
    readonly onEnd?: OnRunEvent<StageInterfaceInt>;

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
     * 			if (!this.flags.every((flag) => storage.getFlag(flag.flag))) {
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
     * The date when the stage starts.
     */
    readonly startDate?: number;

    /**
     * Check if the stage can start.
     * @example
     * ```ts
     * export default class Stage extends StageStoredClass {
     * 	override get canStart(): boolean {
     * 		if (this.flagsRequired.length > 0 && !this.flagsRequired.every((flag) => storage.getFlag(flag.flag))) {
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
    start(props: OnRunProps): Promise<void>;

    /**
     * The number of day/date required to start the stage.
     */
    readonly deltaDateRequired: number;

    /**
     * The list of quests required to start the stage.
     */
    readonly questsRequired: QuestsRequiredType[];
}
