import { OnRunProps } from "@drincs/nqtr";
import { getQuestById, registeredQuests } from "../decorators/QuestDecorator";
import { QuestInterface } from "../interface";

export default class QuestManager {
    /**
     * The quests registered in the game.
     */
    get quests(): QuestInterface[] {
        return Object.values(registeredQuests);
    }
    /**
     * The quests that are started, so they are in progress or completed or failed.
     */
    get startedQuests(): QuestInterface[] {
        return this.quests.filter((quest) => quest.started);
    }
    /**
     * The quests that are in progress.
     */
    get inProgressQuests(): QuestInterface[] {
        return this.quests.filter((quest) => quest.inProgress);
    }
    /**
     * The quests that are completed.
     */
    get completedQuests(): QuestInterface[] {
        return this.quests.filter((quest) => quest.completed);
    }
    /**
     * The quests that are failed.
     */
    get failedQuests(): QuestInterface[] {
        return this.quests.filter((quest) => quest.failed);
    }
    /**
     * The quests that are not started.
     */
    get notStartedQuests(): QuestInterface[] {
        return this.quests.filter((quest) => !quest.started);
    }
    /**
     * Get the quest by the id.
     * @param id The id of the quest.
     * @returns The quest with the id.
     */
    find(id: string): QuestInterface | undefined {
        return getQuestById(id);
    }

    /**
     * Start the quests that must start on the current stage.
     */
    startsStageMustBeStarted(props: OnRunProps) {
        Object.values(registeredQuests).forEach((quest) => {
            if (quest.currentStageMustStart) {
                quest.startCurrentStage(props);
            }
        });
    }
}
