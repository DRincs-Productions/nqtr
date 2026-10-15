import type {
    ActiveScheduling,
    CommitmentIdType,
    CommitmentInterface,
    RoutineHandlerInterface,
} from "@/interface";
import { logger } from "@/utils/log-utility";
import { fixedCommitments, RegisteredCommitments } from "@drincs/nqtr/registries";
import type { CharacterIdType, CharacterInterface } from "@drincs/pixi-vn";
import { PixiError } from "@drincs/pixi-vn/core";
import { storage } from "@drincs/pixi-vn/storage";

interface StoredCommitment extends ActiveScheduling {
    id: string;
    roomId: string;
}

const TEMPORARY_COMMITMENT_CATEGORY_MEMORY_KEY = "___nqtr-temporary_commitment___";
export default class RoutineHandler implements RoutineHandlerInterface {
    /**
     * Get the temporary commitments by its id.
     * @returns The temporary commitments.
     */
    private get temporaryRoutine(): {
        [commitmentId: string]: StoredCommitment;
    } {
        const commitments = storage.get(TEMPORARY_COMMITMENT_CATEGORY_MEMORY_KEY) as
            | string[]
            | {
                  [commitmentId: string]: StoredCommitment;
              };
        if (!commitments) {
            return {};
        } else if (Array.isArray(commitments)) {
            if (commitments.length > 0) {
                throw new PixiError(
                    "obsolete_save",
                    `The save you loaded is not compatible with the current version of NQTR. Please delete the save and start a new game.`,
                );
            }
            return {};
        }

        return commitments;
    }

    get commitmentsIds(): string[] {
        return [...fixedCommitments.keys(), ...Object.keys(this.temporaryRoutine)];
    }

    add(
        commitment:
            | (CommitmentInterface | CommitmentIdType)[]
            | CommitmentInterface
            | CommitmentIdType,
        roomId: string,
        options: ActiveScheduling = {},
    ) {
        if (!Array.isArray(commitment)) {
            commitment = [commitment];
        }
        const temporaryRoutine = this.temporaryRoutine;
        commitment.forEach((commitment) => {
            const commitmentId = typeof commitment === "string" ? commitment : commitment.id;
            temporaryRoutine[commitmentId] = {
                id: commitmentId,
                roomId,
                ...options,
            };
        });
        storage.set(TEMPORARY_COMMITMENT_CATEGORY_MEMORY_KEY, temporaryRoutine as any);
    }

    find(id: string): CommitmentInterface | undefined {
        return RegisteredCommitments.get(id);
    }

    remove(commitment: CommitmentInterface | CommitmentIdType, roomId?: string) {
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

    clearExpiredRoutine() {
        RegisteredCommitments.values().forEach((commitment) => {
            if (commitment.expired) {
                this.remove(commitment);
            }
        });
    }

    get characterCommitments(): { [character: string]: [CommitmentInterface, string] } {
        const temporaryRoutine = this.temporaryRoutine;
        return this.commitmentsIds.reduce(
            (acc: { [character: string]: [CommitmentInterface, string] }, id) => {
                const commitment = RegisteredCommitments.get(id);
                const temp = temporaryRoutine[id];
                const roomId = temp?.roomId || fixedCommitments.get(id);
                if (roomId && commitment?.isActive(temp)) {
                    if (commitment.characters.length > 0) {
                        // all the characters don't already have commitments or the commitment has a higher priority
                        const allAvailable = commitment.characters.every(
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
            },
            {},
        );
    }

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

    getCommitmentByCharacter(
        character: CharacterInterface | CharacterIdType,
    ): CommitmentInterface | undefined {
        const characterId = typeof character === "string" ? character : character.id;
        return this.currentRoutine.find((c) => {
            if (c.characters.map((ch) => ch.id).includes(characterId)) {
                return c;
            }
            return undefined;
        });
    }
}
