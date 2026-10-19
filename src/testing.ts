import { navigator, routine, timeTracker } from "@drincs/nqtr/handlers";
import {
    RegisteredActivities,
    RegisteredCommitments,
    RegisteredQuests,
    RegisteredRooms,
} from "@drincs/nqtr/registries";
import type { OnRunProps } from "@/types";

/** Actions applications can replace with their UI-aware implementations. */
export interface NqtrTestingActions {
    goToRoom(roomId: string): Promise<void>;
    increaseTime(amount: number): Promise<void>;
    increaseDate(days: number, hour?: number): Promise<void>;
    addActivity(roomId: string, activityId: string): Promise<void>;
    removeActivity(roomId: string, activityId: string): Promise<void>;
    addCommitment(roomId: string, commitmentId: string): Promise<void>;
    removeRoutine(commitmentId: string): Promise<void>;
    runActivity(activityId: string): Promise<unknown>;
    runCommitment(commitmentId: string): Promise<unknown>;
    startQuest(questId: string): Promise<void>;
    continueQuest(questId: string): Promise<boolean>;
}

/** Resolve an ID without silently accepting missing content. */
function required<T>(
    registry: { has(id: string): boolean; get(id: string): T | undefined },
    id: string,
    kind: string,
): T {
    if (!registry.has(id)) throw new Error(`NQTR testing: unknown ${kind} "${id}".`);
    const value = registry.get(id);
    if (!value) throw new Error(`NQTR testing: unavailable ${kind} "${id}".`);
    return value;
}

function createTesting() {
    let props: OnRunProps = {};
    let actions: Partial<NqtrTestingActions> = {};
    let active: { key: string; api: NqtrTestingAPI } | undefined;
    const room = (id: string) => required(RegisteredRooms, id, "room");
    const activity = (id: string) => required(RegisteredActivities, id, "activity");
    const commitment = (id: string) => required(RegisteredCommitments, id, "commitment");
    const quest = (id: string) => required(RegisteredQuests, id, "quest");
    const defaults: NqtrTestingActions = {
        async goToRoom(id) {
            navigator.currentRoom = room(id);
        },
        async increaseTime(amount) {
            timeTracker.increaseTime(amount);
        },
        async increaseDate(days, hour) {
            timeTracker.increaseDate(days, hour);
        },
        async addActivity(id, activityId) {
            room(id).addActivity(activity(activityId));
        },
        async removeActivity(id, activityId) {
            room(id).removeActivity(activity(activityId));
        },
        async addCommitment(id, commitmentId) {
            room(id).addCommitment(commitment(commitmentId));
        },
        async removeRoutine(id) {
            routine.remove(commitment(id));
        },
        async runActivity(id) {
            return await activity(id).run(props);
        },
        async runCommitment(id) {
            return await commitment(id).run(props);
        },
        async startQuest(id) {
            await quest(id).start(props);
        },
        async continueQuest(id) {
            return await quest(id).continue(props);
        },
    };
    const reads = {
        getCurrentRoom: () => (navigator.currentRoomId ? navigator.currentRoom : undefined),
        getRooms: () => RegisteredRooms.values(),
        getActivities: () => RegisteredActivities.values(),
        getCommitments: () => RegisteredCommitments.values(),
        getRoutine: () => [...new Set(routine.currentRoutine)],
        getQuests: () => RegisteredQuests.values(),
    };
    function disable() {
        if (active && typeof window !== "undefined") {
            const target = window as unknown as Record<string, unknown>;
            if (target[active.key] === active.api) delete target[active.key];
        }
        active = undefined;
    }
    function enable(options?: { windowKey?: string }): NqtrTestingAPI {
        disable();
        const wrapped = Object.fromEntries(
            Object.entries(defaults).map(([key, fallback]) => [
                key,
                (...args: unknown[]) =>
                    Promise.resolve().then(() => {
                        const action = actions[key as keyof NqtrTestingActions] ?? fallback;
                        return (action as (...values: unknown[]) => unknown)(...args);
                    }),
            ]),
        ) as unknown as NqtrTestingActions;
        const api = { ...wrapped, ...reads };
        const key = options?.windowKey ?? "nqtr";
        if (typeof window !== "undefined")
            (window as unknown as Record<string, unknown>)[key] = api;
        active = { key, api };
        return api;
    }
    return {
        setProps(value: OnRunProps) {
            props = value;
        },
        setActions(value: Partial<NqtrTestingActions>) {
            actions = { ...value };
        },
        enable,
        disable,
        isEnabled: () => active !== undefined,
    };
}

/** Direct reads return registered domain objects; no React hook or cache is involved. */
export interface NqtrTestingAPI extends NqtrTestingActions {
    getCurrentRoom(): import("@/interface").RoomInterface | undefined;
    getRooms(): import("@/interface").RoomInterface[];
    getActivities(): import("@/interface").ActivityInterface[];
    getCommitments(): import("@/interface").CommitmentInterface[];
    getRoutine(): import("@/interface").CommitmentInterface[];
    getQuests(): import("@/interface").QuestInterface[];
}

/** Opt-in browser testing bridge. Keep props and overrides fresh in the application. */
export const testing = createTesting();
