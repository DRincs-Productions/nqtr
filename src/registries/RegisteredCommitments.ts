import { CachedMap } from "@drincs/pixi-vn";
import type { CommitmentInterface } from "../interface";

/**
 * A Map that contains all commitments registered and available to be used.
 * The key is the id of the commitment and the value is the commitment itself.
 */
export const registeredCommitments = new CachedMap<string, CommitmentInterface>({ cacheSize: 20 });
export const fixedCommitments = new CachedMap<string, CommitmentInterface>({ cacheSize: 20 });
