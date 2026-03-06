import { fixedCommitments, RegisteredCommitments, registeredCommitments } from "@drincs/nqtr/registries";
import { PixiError, type CharacterInterface } from "@drincs/pixi-vn";
import { storage } from "@drincs/pixi-vn/storage";
import type { CommitmentInterface } from "../interface";
import { logger } from "../utils/log-utility";

interface StoredCommitment {
    id: string;
    roomId: string;
}

const TEMPORARY_COMMITMENT_CATEGORY_MEMORY_KEY = "___nqtr-temporary_commitment___";
export default class RoutineHandler {
    /**
     * Get the temporary commitments by its id.
     * @returns The temporary commitments.
     */
    private get temporaryRoutine(): {
        [commitmentId: string]: StoredCommitment;
    } {
        let commitments = storage.get(TEMPORARY_COMMITMENT_CATEGORY_MEMORY_KEY) as
            | string[]
            | {
                  [commitmentId: string]: StoredCommitment;
              };
        if (!commitments) {
            return {};
        } else if (Array.isArray(commitments)) {
            throw new PixiError(
                "obsolete_save",
                `The save you loaded is not compatible with the current version of NQTR. Please delete the save and start a new game.`,
            );
        }

        return commitments;
    }

    get commitmentsIds(): string[] {
        return [...fixedCommitments.keys(), ...Object.keys(this.temporaryRoutine)];
    }

    /**
     * This feature adds the commitments during the game session.
     * @param commitment The commitment or commitments to add.
     */
    add(commitment: CommitmentInterface[] | CommitmentInterface) {
        if (!Array.isArray(commitment)) {
            commitment = [commitment];
        }
        let commitmentsIds = commitment
            .map((commitment) => {
                let commitmentTest = RegisteredCommitments.get(commitment.id);
                if (!commitmentTest) {
                    console.warn(`[NQTR] Commitment ${commitment.id} not found, it will be ignored`);
                    return undefined;
                }
                return commitment.id;
            })
            .filter((id) => id !== undefined);

        storage.set(TEMPORARY_COMMITMENT_CATEGORY_MEMORY_KEY, commitmentsIds);
    }

    /**
     * Get the commitments added during the game session.
     * @param id The id of the commitment.
     * @returns The commitment or undefined if not found.
     */
    find(id: string): CommitmentInterface | undefined {
        return RegisteredCommitments.get(id);
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
        RegisteredCommitments.values().forEach((commitment) => {
            if (commitment.expired) {
                registeredCommitments.delete(commitment.id);
            }
        });
    }

    private get character_commitments(): { [character: string]: CommitmentInterface } {
        let character_commitments: { [character: string]: CommitmentInterface } = {};
        this.commitmentsIds.forEach((id) => {
            const c = RegisteredCommitments.get(id);
            if (c && c.isActive()) {
                if (c.characters.length > 0) {
                    // all the characters don't already have commitments or the commitment has a higher priority
                    let allAvailable = c.characters.every(
                        (ch) => !character_commitments[ch.id] || c.priority > character_commitments[ch.id].priority,
                    );
                    if (allAvailable) {
                        c.characters.forEach((ch) => {
                            character_commitments[ch.id] = c;
                        });
                    }
                } else {
                    logger.error(`The commitment ${c.id} has no characters assigned`);
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
     * Get the character commitment.
     * @param character The character.
     * @returns The commitment or undefined if not found.
     */
    getCommitmentByCharacter(character: CharacterInterface): CommitmentInterface | undefined {
        this.currentRoutine.forEach((c) => {
            if (c.characters.map((ch) => ch.id).includes(character.id)) {
                return c;
            }
        });
        return undefined;
    }
}
