import type { QuestInterface as QuestInterfaceInt, StageInterface } from "@/interface";
import type { OnRunEvent } from "@/types";
import type { OnRunProps } from "@/types";

export default interface QuestInterface extends QuestBaseInternalInterface {}

export interface QuestBaseInternalInterface {
    /**
     * The id of the quest.
     */
    readonly id: string;
    /**
     * The stages of the quest.
     */
    readonly stages: StageInterface[];

    /**
     * The index of the current stage.
     */
    currentStageIndex?: number;

    /**
     * The current stage.
     */
    readonly currentStage?: StageInterface;

    /**
     * If the quest is started.
     */
    readonly started: boolean;

    /**
     * If the quest is started and not completed and not failed.
     */
    readonly inProgress: boolean;

    /**
     * If the quest is completed.
     */
    readonly completed: boolean;

    /**
     * If the quest is failed.
     */
    readonly failed: boolean;

    /**
     * The function that will be called when the quest starts.
     */
    readonly onStart?: OnRunEvent<QuestInterfaceInt>;

    /**
     * @deprecated Use {@link onContinue} instead. The function that will be called when the quest goes to the next stage.
     */
    readonly onNextStage?: OnRunEvent<QuestInterfaceInt>;
    /**
     * The function that will be called when the quest goes to the next stage.
     */
    readonly onContinue?: OnRunEvent<QuestInterfaceInt>;

    /**
     * Start the quest.
     * @param props The properties for the start stage. If you not want to pass any property, you can pass an {}.
     * @returns
     */
    start(props: OnRunProps): Promise<void>;

    /**
     * Go to the next stage if the current stage is completed.
     * If you want to force the change of stage, use {@link advanceUnconditionally}.
     * @param props The properties. If you not want to pass any property, you can pass an {}.
     * @returns true if the stage was changed, false otherwise.
     */
    advanceIfCompleted(props: OnRunProps): Promise<boolean>;

    /**
     * Complete the current stage and go to the next stage with {@link advanceUnconditionally}.
     * If you want to go to the next stage only if the current stage is completed, use {@link advanceIfCompleted}.
     * @param props The properties. If you not want to pass any property, you can pass an {}.
     * @returns true if the stage was changed, false otherwise.
     */
    continue(props: OnRunProps): Promise<boolean>;

    /**
     * Ignore the completed state of the current stage and go to the next stage without checking if the current stage is completed.
     * If you want to go to the next stage only if the current stage is completed, use {@link advanceIfCompleted}.
     * @param props The properties. If you not want to pass any property, you can pass an {}.
     * @returns returns true if the stage was changed, false otherwise.
     */
    advanceUnconditionally(props: OnRunProps): Promise<boolean>;

    /**
     * If the current stage must start. It is true if the current stage is not started, can start and not completed.
     */
    readonly currentStageMustStart: boolean;

    /**
     * Start the current stage. This is a system function, do not use it directly.
     * @param props The properties for the start stage. If you not want to pass any property, you can pass an {}.
     */
    startCurrentStage(props: OnRunProps): Promise<void>;
}
