import type { QuestInterface } from "@/interface";
import { logger } from "@/utils/log-utility";
import { CachedMap } from "@drincs/pixi-vn";

/**
 * A Map that contains all quests registered and available to be used.
 * The key is the id of the quest and the value is the quest itself.
 */
export const registeredQuests = new CachedMap<string, QuestInterface>({ cacheSize: 5 });

namespace RegisteredQuest {
    /**
     * Save a quest in the registered quests. If the quest already exists, it will be overwritten.
     * @param quests The quest to save.
     * @returns
     */
    export function add(...quests: (QuestInterface | QuestInterface[])[]) {
        for (const quest of quests) {
            if (Array.isArray(quest)) {
                add(...quest);
                return;
            }
            registeredQuests.set(quest.id, quest);
        }
    }
    /**
     * Get a quest by its id.
     * @param id The id of the quest.
     * @returns The quest or undefined if not found.
     */
    export function get(id: string): QuestInterface | undefined {
        try {
            const quest = registeredQuests.get(id);
            if (!quest) {
                console.warn(`[NQTR] Quest ${id} not found, you should register it first`);
                return;
            }
            return quest;
        } catch (e) {
            logger.error(`Error while getting Quest ${id}`, e);
            return;
        }
    }
    /**
     * Get a list of all quests registered.
     * @returns An array of quests.
     */
    export function values(): QuestInterface[] {
        return Array.from(registeredQuests.values());
    }
    /**
     * Check if a quest is registered.
     * @param id The id of the quest.
     * @returns True if the quest is registered, false otherwise.
     */
    export function has(id: string): boolean {
        return registeredQuests.has(id);
    }

    /**
     * Remove all registered quests.
     * Primarily used by the Vite plugin to reset state between hot-module reloads.
     */
    export function clear(): void {
        registeredQuests.clear();
    }
}
export default RegisteredQuest;
