import type { CharacterIdType, CharacterInterface } from "@drincs/pixi-vn";
import type ActiveScheduling from "@/interface/activity/ActiveScheduling";
import type { CommitmentIdType } from "@/interface/NqtrIds";
import type CommitmentInterface from "@/interface/activity/CommitmentInterface";

/**
 * Handler that manages the routine of the characters: the commitments (fixed or added during the
 * game session) and the rooms where they take place.
 */
export default interface RoutineHandlerInterface {
    /**
     * The ids of all the commitments: the fixed ones and the ones added during the game session.
     */
    readonly commitmentsIds: string[];
    /**
     * The commitments that are currently active, grouped by character id.
     * Each value is a tuple with the commitment and the id of the room where it takes place.
     * If a character has two or more commitments at the same time, only the one with the highest priority is kept.
     */
    readonly characterCommitments: { [character: string]: [CommitmentInterface, string] };
    /**
     * The current commitments. The hidden commitments are not included.
     * In case there is a character who has two or more commitments at the same time, will be selected the commitment with the highest priority.
     * Higher priority commitments are calculated using the following steps:
     * 1. The commitments that have Commitments BaseModel.priority set to a higher value will be selected first.
     * 2. If there are commitments with the same priority, the commitments that are not fixed will be selected first.
     * 3. If there are commitments with the same priority and the same fixed status, priority will be given to the commitment with a lower index.
     */
    readonly currentRoutine: CommitmentInterface[];
    /**
     * The current commitments grouped by the id of the room where they take place.
     */
    readonly roomCommitments: { [roomId: string]: CommitmentInterface[] };
    /**
     * Add commitments during the game session.
     * @param commitment The commitment or commitments (or their ids) to add.
     * @param roomId The id of the room where the commitment is.
     * @param options The scheduling options of the commitment (e.g. when it starts and ends).
     */
    add(
        commitment:
            | (CommitmentInterface | CommitmentIdType)[]
            | CommitmentInterface
            | CommitmentIdType,
        roomId: string,
        options?: ActiveScheduling,
    ): void;
    /**
     * Get a registered commitment by its id.
     * @param id The id of the commitment.
     * @returns The commitment or undefined if not found.
     */
    find(id: string): CommitmentInterface | undefined;
    /**
     * Remove a commitment added during the game session. Fixed commitments can't be removed.
     * @param commitment The commitment or commitment id to remove.
     * @param roomId If set, the commitment is removed only if it was added to this room.
     */
    remove(commitment: CommitmentInterface | CommitmentIdType, roomId?: string): void;
    /**
     * Clear all the expired commitments.
     */
    clearExpiredRoutine(): void;
    /**
     * Get the current commitment of a character.
     * @param character The character or the character id.
     * @returns The commitment or undefined if not found.
     */
    getCommitmentByCharacter(
        character: CharacterInterface | CharacterIdType,
    ): CommitmentInterface | undefined;
}
