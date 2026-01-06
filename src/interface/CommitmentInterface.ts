import { CommitmentInterface as OverrideCommitmentInterface } from "@drincs/nqtr";
import type { CharacterInterface } from "@drincs/pixi-vn";
import { RoomInterface } from ".";
import { ExecutionType } from "../types";
import { ActivityBaseInternalInterface } from "./ActivityInterface";

export default interface CommitmentInterface extends CommitmentBaseInternalInterface, OverrideCommitmentInterface {}

export interface CommitmentBaseInternalInterface extends ActivityBaseInternalInterface {
    /**
     * The character or characters that are in the commitment and so in the room.
     */
    readonly characters: CharacterInterface[];
    /**
     * The room where the commitment is.
     */
    readonly room: RoomInterface;
    /**
     * Execution type. If is "automatic" the onRun() runned automatically when the palayer is in the room. If is "interaction" the player must interact with the character to run the onRun() function.
     * If you set "automatic" remember to remove the commitment when it is no longer needed, because otherwise it repeats itself every time.
     */
    executionType: ExecutionType;
    /**
     * The priority. The higher the number, the higher the priority.
     * To ensure that a character is not in 2 places at the same time, if there are 2 or more valid commits at the same time and with the same character, the one with the highest priority will be chosen.
     */
    priority: number;
}
