import { RegisteredActivities, fixedCommitments, registeredCommitments } from "@drincs/nqtr/registries";
import type { CharacterInterface } from "@drincs/pixi-vn";
import { storage } from "@drincs/pixi-vn/storage";
import { CommitmentStoredClass } from "../classes";
import type { ActivityInterface, CommitmentInterface } from "../interface";
import { logger } from "../utils/log-utility";

const TEMPORARY_COMMITMENT_CATEGORY_MEMORY_KEY = "___nqtr-temporary_commitment___";
export default class RoutineHandler {
    get fixedRoutine(): CommitmentInterface[] {
        return [...fixedCommitments.values()];
    }
    /**
     * Set a commitment as fixed, it will be always available. They cannot be deleted or edit during the game session.
     */
    set fixedRoutine(commitments: CommitmentInterface[]) {
        commitments.forEach((c) => {
            if (fixedCommitments.has(c.id)) {
                console.warn(`[NQTR] Commitment id ${c.id} already exists, it will be overwritten`);
            }
            fixedCommitments.set(c.id, c);
        });
    }

    /**
     * Get the temporary commitments by its id.
     * @returns The temporary commitments.
     */
    get temporaryRoutine(): CommitmentInterface[] {
        let commitmentsIds = storage.get<string[]>(TEMPORARY_COMMITMENT_CATEGORY_MEMORY_KEY);
        if (!commitmentsIds) {
            return [];
        }
        let commitments = commitmentsIds.reduce((acc: CommitmentInterface[], id) => {
            const c = RegisteredActivities.get(id);
            if (c && c instanceof CommitmentStoredClass) {
                acc.push(c);
            }
            return acc;
        }, []);
        return commitments;
    }

    get allRoutine(): CommitmentInterface[] {
        return [...this.fixedRoutine, ...this.temporaryRoutine];
    }

    /**
     * This feature adds the commitments during the game session.
     * @param commitment The commitment or commitments to add.
     */
    add(commitment: CommitmentInterface[] | CommitmentInterface) {
        if (!Array.isArray(commitment)) {
            commitment = [commitment];
        }
        let commitmentsIds = commitment.reduce((acc: string[], commitment) => {
            let commitmentTest = RegisteredActivities.get(commitment.id);
            if (!commitmentTest) {
                console.warn(`[NQTR] Commitment ${commitment.id} not found, it will be ignored`);
                return acc;
            }
            acc.push(commitment.id);
            return acc;
        }, []);

        storage.set(TEMPORARY_COMMITMENT_CATEGORY_MEMORY_KEY, commitmentsIds);
    }

    /**
     * Get the commitments added during the game session.
     * @param id The id of the commitment.
     * @returns The commitment or undefined if not found.
     */
    find(id: string): CommitmentInterface | undefined {
        const commitment = RegisteredActivities.get(id);
        if (commitment instanceof CommitmentStoredClass) {
            return commitment;
        }
    }

    /**
     * Remove the commitments added during the game session.
     * @param commitment The commitment or commitments to remove.
     */
    remove(commitment: CommitmentInterface[] | CommitmentInterface) {
        if (!Array.isArray(commitment)) {
            commitment = [commitment];
        }
        let commitmentsIds = commitment.map((commitment) => {
            return commitment.id;
        });

        let currentCommitments = storage.get<string[]>(TEMPORARY_COMMITMENT_CATEGORY_MEMORY_KEY);
        if (!currentCommitments) {
            return;
        }
        currentCommitments = currentCommitments.filter((id) => !commitmentsIds.includes(id));
        storage.set(TEMPORARY_COMMITMENT_CATEGORY_MEMORY_KEY, currentCommitments);
    }

    /**
     * Clear all the expired commitments.
     */
    clearExpiredRoutine() {
        RegisteredActivities.values().forEach((commitment) => {
            if (commitment.expired) {
                registeredCommitments.delete(commitment.id);
            }
        });
    }

    private get character_commitments() {
        let character_commitments: { [character: string]: CommitmentInterface } = {};
        [...this.fixedRoutine, ...this.temporaryRoutine].forEach((c) => {
            if (c.characters.length == 0) {
                logger.error(`The commitment ${c.id} has no characters assigned`);
                return;
            }
            if (c.isActive) {
                // all the characters don't already have commitments or the commitment has a higher priority
                let allAvailable = c.characters.every(
                    (ch) => !character_commitments[ch.id] || c.priority > character_commitments[ch.id].priority,
                );
                if (allAvailable) {
                    c.characters.forEach((ch) => {
                        character_commitments[ch.id] = c;
                    });
                }
            }
        });
        return character_commitments;
    }

    /**
     * Get the current commitments. The hidden commitments are not included.
     * In case there is a character who has two or more commitments at the same time, will be selected the commitment with the highest priority.
     * Higher priority commitments are calculated using the following steps:
     * 1. The commitments that have Commitments BaseModel.priority set to a higher value will be selected first.
     * 2. If there are commitments with the same priority, the commitments that are not fixed will be selected first.
     * 3. If there are commitments with the same priority and the same fixed status, priority will be given to the commitment with a lower index.
     * @returns The current commitments.
     */
    get currentRoutine(): CommitmentInterface[] {
        return Object.values(this.character_commitments);
    }

    /**
     * Filter activities based on character availability
     */
    filterActivitiesByCharacterAvailability(activities: ActivityInterface[]): ActivityInterface[] {
        let character_commitments = this.character_commitments;
        return activities.filter((activity) => {
            if (!(activity instanceof CommitmentStoredClass)) {
                return true;
            }
            if (activity.characters.length === 0) {
                logger.error(`The commitment ${activity.id} has no characters assigned`);
                return false;
            }
            return activity.characters.every((ch) => {
                let commitment = character_commitments[ch.id];
                if (!commitment) {
                    return true;
                }
                return activity.id === commitment.id;
            });
        });
    }

    /**
     * Get the character commitment.
     * @param character The character.
     * @returns The commitment or undefined if not found.
     */
    getCommitmentByCharacter(character: CharacterInterface): CommitmentInterface | undefined {
        this.currentRoutine.forEach((commitment) => {
            if (commitment.characters.map((ch) => ch.id).includes(character.id)) {
                return commitment;
            }
        });
        return undefined;
    }
}
