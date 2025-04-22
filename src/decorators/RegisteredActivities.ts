import { ActivityInterface } from "../interface";

/**
 * A Map that contains all activities registered and available to be used.
 * The key is the id of the activity and the value is the activity itself.
 */
const registeredActivities = new Map<string, ActivityInterface>();

namespace RegisteredActivities {
    export function add(activities: ActivityInterface | ActivityInterface[]) {
        if (Array.isArray(activities)) {
            activities.forEach((activity) => RegisteredActivities.add(activity));
            return;
        }
        registeredActivities.set(activities.id, activities);
    }

    /**
     * Get an activity by its id.
     * @param id The id of the activity.
     * @returns The activity or undefined if not found.
     */
    export function get(id: string): ActivityInterface | undefined {
        try {
            let activity = registeredActivities.get(id);
            if (!activity) {
                console.error(`[NQTR] Activity ${id} not found`);
                return;
            }
            return activity;
        } catch (e) {
            console.error(`[NQTR] Error while getting Activity ${id}`, e);
            return;
        }
    }
}
export default RegisteredActivities;
