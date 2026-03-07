import { fixedCommitments, RegisteredCommitments } from "@drincs/nqtr/registries";
import { type CharacterInterface } from "@drincs/pixi-vn";
import { PixiError } from "@drincs/pixi-vn/core";
import { storage } from "@drincs/pixi-vn/storage";
import type { ActiveScheduling, CommitmentInterface } from "../interface";
import { logger } from "../utils/log-utility";

interface StoredCommitment extends ActiveScheduling {
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
     * @param roomId The id of the room where the commitment is.
     */
    add(commitment: CommitmentInterface[] | CommitmentInterface, roomId: string, options: ActiveScheduling = {}) {
        if (!Array.isArray(commitment)) {
            commitment = [commitment];
        }
        const temporaryRoutine = this.temporaryRoutine;
        commitment.forEach((commitment) => {
            if (RegisteredCommitments.get(commitment.id)) {
                logger.warn(`The commitment ${commitment.id} is already registered, it will be overwritten`);
            }
            RegisteredCommitments.add(commitment);
            temporaryRoutine[commitment.id] = {
                id: commitment.id,
                roomId,
                ...options,
            };
        });
        storage.set(TEMPORARY_COMMITMENT_CATEGORY_MEMORY_KEY, temporaryRoutine as any);
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
     * @param commitment The commitment or commitment id to remove.
     * @param roomId The id of the room where the commitment is.
     */
    remove(commitment: CommitmentInterface | string, roomId?: string) {
        if (typeof commitment !== "string") {
            commitment = commitment.id;
        }
        const temporaryRoutine = this.temporaryRoutine;
        if (temporaryRoutine[commitment]) {
            if (!roomId || temporaryRoutine[commitment].roomId === roomId) {
                delete temporaryRoutine[commitment];
            }
        } else {
            logger.warn(
                `The commitment ${commitment} was not found in the temporary routine, so it will be ignored. If you want to remove a fixed commitment, you can add it to the temporary routine with a same character.`,
            );
        }
        storage.set(TEMPORARY_COMMITMENT_CATEGORY_MEMORY_KEY, temporaryRoutine as any);
    }

    /**
     * Clear all the expired commitments.
     */
    clearExpiredRoutine() {
        RegisteredCommitments.values().forEach((commitment) => {
            if (commitment.expired) {
                this.remove(commitment);
            }
        });
    }

    get characterCommitments(): { [character: string]: [CommitmentInterface, string] } {
        const temporaryRoutine = this.temporaryRoutine;
        return this.commitmentsIds.reduce((acc: { [character: string]: [CommitmentInterface, string] }, id) => {
            const commitment = RegisteredCommitments.get(id);
            const temp = temporaryRoutine[id];
            const roomId = temp?.roomId || fixedCommitments.get(id)?.[1];
            if (roomId && commitment && commitment.isActive(temp)) {
                if (commitment.characters.length > 0) {
                    // all the characters don't already have commitments or the commitment has a higher priority
                    let allAvailable = commitment.characters.every(
                        (ch) => !acc[ch.id] || commitment.priority > acc[ch.id][0].priority,
                    );
                    if (allAvailable) {
                        commitment.characters.forEach((ch) => {
                            acc[ch.id] = [commitment, roomId];
                        });
                    }
                } else {
                    logger.error(`The commitment ${commitment.id} has no characters assigned`);
                }
            }
            return acc;
        }, {});
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
        return Object.values(this.characterCommitments).map(([commitment]) => commitment);
    }

    get roomCommitments(): { [roomId: string]: CommitmentInterface[] } {
        return Object.values(this.characterCommitments).reduce(
            (acc: { [roomId: string]: CommitmentInterface[] }, commitment) => {
                const roomId = commitment[1];
                if (!acc[roomId]) {
                    acc[roomId] = [];
                }
                acc[roomId].push(commitment[0]);
                return acc;
            },
            {},
        );
    }

    /**
     * Get the character commitment.
     * @param character The character.
     * @returns The commitment or undefined if not found.
     */
    getCommitmentByCharacter(character: CharacterInterface): CommitmentInterface | undefined {
        return this.currentRoutine.find((c) => {
            if (c.characters.map((ch) => ch.id).includes(character.id)) {
                return c;
            }
        });
    }
}
