import { OnRunProps } from "@drincs/nqtr";
import RegisteredQuest from "../decorators/RegisteredQuests";
import { QuestInterface } from "../interface";

export default class QuestManager {
    /**
     * The quests registered in the game.
     */
    get quests(): QuestInterface[] {
        return RegisteredQuest.values();
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
        return RegisteredQuest.get(id);
    }

    /**
     * Start the quests that must start on the current stage.
     */
    async startsStageMustBeStarted(props: OnRunProps) {
        let promises: Promise<void>[] = this.quests.map((quest) => {
            if (quest.currentStageMustStart) {
                return quest.startCurrentStage(props);
            }
            return Promise.resolve();
        });
        await Promise.all(promises);
    }
}
