import type { QuestInterface } from "@/interface";
import type { OnRunProps } from "@drincs/nqtr";

/**
 * Handler that manages the quests registered in the game.
 */
export default interface QuestHandlerInterface {
    /**
     * The quests registered in the game.
     */
    readonly quests: QuestInterface[];
    /**
     * The quests that are started, so they are in progress or completed or failed.
     */
    readonly startedQuests: QuestInterface[];
    /**
     * The quests that are in progress.
     */
    readonly inProgressQuests: QuestInterface[];
    /**
     * The quests that are completed.
     */
    readonly completedQuests: QuestInterface[];
    /**
     * The quests that are failed.
     */
    readonly failedQuests: QuestInterface[];
    /**
     * The quests that are not started.
     */
    readonly notStartedQuests: QuestInterface[];
    /**
     * Get the quest by the id.
     * @param id The id of the quest.
     * @returns The quest with the id, or `undefined` if not found.
     */
    find(id: string): QuestInterface | undefined;
    /**
     * Start the current stage of every quest whose current stage must be started automatically.
     * @param props The props passed to the functions triggered by the stages. See {@link OnRunProps}.
     */
    startsStageMustBeStarted(props: OnRunProps): Promise<void>;
}
