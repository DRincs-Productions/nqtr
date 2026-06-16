import type { ActivityInterface } from "@/interface";
import { logger } from "@/utils/log-utility";
import { CachedMap } from "@drincs/pixi-vn";

/**
 * A Map that contains all activities registered and available to be used.
 * The key is the id of the activity and the value is the activity itself.
 */
export const registeredActivities = new CachedMap<string, ActivityInterface>({ cacheSize: 20 });

namespace RegisteredActivities {
    /**
     * Save an activity in the registered activities. If the activity already exists, it will be overwritten.
     * @param activities The activity to save.
     * @returns
     */
    export function add(...activities: (ActivityInterface | ActivityInterface[])[]) {
        for (const activity of activities) {
            if (Array.isArray(activity)) {
                add(...activity);
                continue;
            }
            registeredActivities.set(activity.id, activity);
        }
    }

    /**
     * Get an activity by its id.
     * @param id The id of the activity.
     * @returns The activity or undefined if not found.
     */
    export function get(id: string): ActivityInterface | undefined {
        try {
            const activity = registeredActivities.get(id);
            if (!activity) {
                console.warn(`[NQTR] Activity ${id} not found, you should register it first`);
                return;
            }
            return activity;
        } catch (e) {
            logger.error(`Error while getting Activity ${id}`, e);
            return;
        }
    }

    /**
     * Get a list of all activities registered.
     * @returns An array of activities.
     */
    export function values(): ActivityInterface[] {
        return Array.from(registeredActivities.values());
    }

    /**
     * Check if an activity is registered.
     * @param id The id of the activity.
     * @returns True if the activity is registered, false otherwise.
     */
    export function has(id: string): boolean {
        return registeredActivities.has(id);
    }

    /**
     * Remove all registered activities.
     * Primarily used by the Vite plugin to reset state between hot-module reloads.
     */
    export function clear(): void {
        registeredActivities.clear();
    }
}
export default RegisteredActivities;
