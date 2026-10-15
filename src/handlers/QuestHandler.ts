import type { QuestHandlerInterface, QuestInterface } from "@/interface";
import type { OnRunProps } from "@drincs/nqtr";
import { RegisteredQuests } from "@drincs/nqtr/registries";

export default class QuestHandler implements QuestHandlerInterface {
    get quests(): QuestInterface[] {
        return RegisteredQuests.values();
    }
    get startedQuests(): QuestInterface[] {
        return this.quests.filter((quest) => quest.started);
    }
    get inProgressQuests(): QuestInterface[] {
        return this.quests.filter((quest) => quest.inProgress);
    }
    get completedQuests(): QuestInterface[] {
        return this.quests.filter((quest) => quest.completed);
    }
    get failedQuests(): QuestInterface[] {
        return this.quests.filter((quest) => quest.failed);
    }
    get notStartedQuests(): QuestInterface[] {
        return this.quests.filter((quest) => !quest.started);
    }
    find(id: string): QuestInterface | undefined {
        return RegisteredQuests.get(id);
    }

    async startsStageMustBeStarted(props: OnRunProps) {
        const promises: Promise<void>[] = this.quests.map((quest) => {
            if (quest.currentStageMustStart) {
                return quest.startCurrentStage(props);
            }
            return Promise.resolve();
        });
        await Promise.all(promises);
    }
}
