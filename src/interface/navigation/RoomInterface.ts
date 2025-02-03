import { RoomInterface as OverrideRoomInterface } from "@drincs/nqtr";
import { CharacterInterface } from "@drincs/pixi-vn";
import { CommitmentInterface, LocationInterface as LocationInterfaceInt } from "..";
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
     * Get the character commitments of the room.
     */
    readonly routine: CommitmentInterface[];
    /**
     * Get the characters in the room.
     */
    readonly characters: CharacterInterface[];
}
