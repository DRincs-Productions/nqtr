import { CachedMap } from "@drincs/pixi-vn";
import { CommitmentInterface } from "../interface";
import { logger } from "../utils/log-utility";

/**
 * A Map that contains all commitments registered and available to be used.
 * The key is the id of the commitment and the value is the commitment itself.
 */
export const registeredCommitments = new CachedMap<string, CommitmentInterface>({ cacheSize: 20 });
export const fixedCommitments = new CachedMap<string, CommitmentInterface>({ cacheSize: 20 });

namespace RegisteredCommitments {
    /**
     * Save a commitment in the registered commitments. If the commitment already exists, it will be overwritten.
     * @param commitment The commitment to save.
     * @returns
     */
    export function add(commitments: CommitmentInterface | CommitmentInterface[]) {
        if (Array.isArray(commitments)) {
            commitments.forEach((commitment) => RegisteredCommitments.add(commitment));
            return;
        }
        console.warn(`[NQTR] Registering commitment ${commitments.id}`, commitments);
        registeredCommitments.set(commitments.id, commitments);
    }
    /**
     * Get a commitment by its id.
     * @param id The id of the commitment.
     * @returns The commitment or undefined if not found.
     */
    export function get(id: string): CommitmentInterface | undefined {
        try {
            let commitment = registeredCommitments.get(id);
            if (!commitment) {
                console.warn(`[NQTR] Commitment ${id} not found, you should register it first`);
                return;
            }
            return commitment;
        } catch (e) {
            logger.error(`Error while getting Commitment ${id}`, e);
            return;
        }
    }
    /**
     * Get a list of all commitments registered.
     * @returns An array of commitments.
     */
    export function values(): CommitmentInterface[] {
        return Array.from(registeredCommitments.values());
    }
    /**
     * Check if a commitment is registered.
     * @param id The id of the commitment.
     * @returns True if the commitment is registered, false otherwise.
     */
    export function has(id: string): boolean {
        return registeredCommitments.has(id);
    }
}
export default RegisteredCommitments;
