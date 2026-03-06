import { RoomInterface as OverrideRoomInterface } from "@drincs/nqtr";
import type { CharacterInterface } from "@drincs/pixi-vn";
import { CommitmentInterface, LocationInterface as LocationInterfaceInt } from "..";
import { OnRunAsyncFunction } from "../../types";
import DateSchedulingInterface from "../DateSchedulingInterface";
import TimeSchedulingInterface from "../TimeSchedulingInterface";
import NavigationAbstractInterface from "./NavigationAbstractClass";

export default interface RoomInterface extends RoomBaseInternalInterface, OverrideRoomInterface {}

export interface RoomBaseInternalInterface extends NavigationAbstractInterface {
    /**
     * The id of the room.
     */
    readonly id: string;
    /**
     * The location where the room is.
     */
    readonly location: LocationInterfaceInt;
    /**
     * Connects the commitment to the class.
     * @param commitment The commitment to connect to the class.
     * @param options
     * @returns
     */
    addCommitment(
        commitment: CommitmentInterface,
        options?: {
            /**
             * Time slot in which commitment will be active.
             */
            timeSlot?: TimeSchedulingInterface;
            /**
             * Used to schedule what date it will be added and removed.
             */
            dateScheduling?: DateSchedulingInterface;
        },
    ): void;
    /**
     * Disconnects the commitment from the class.
     * @param commitment The commitment to disconnect from the class.
     * @param options
     */
    removeCommitment(commitment: CommitmentInterface | string, options?: Pick<DateSchedulingInterface, "to">): void;
    /**
     * Get the character commitments of the room.
     */
    readonly routine: CommitmentInterface[];
    /**
     * Get the characters in the room.
     */
    readonly characters: CharacterInterface[];
    /**
     * Get the functions that will be executed when the room is visited.
     */
    readonly automaticFunctions: OnRunAsyncFunction[];
}
