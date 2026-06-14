import type { MapInterface } from "@/interface";
import type NavigationAbstractInterface from "@/interface/navigation/NavigationAbstractClass";
import type RoomInterface from "@/interface/navigation/RoomInterface";

export default interface LocationInterface extends LocationInternalInterface {}

export interface LocationInternalInterface extends NavigationAbstractInterface {
    /**
     * The id of the location.
     */
    readonly id: string;
    /**
     * The map where the location is.
     */
    readonly map: MapInterface;
    /**
     * Get all rooms in the location.
     * @returns The rooms in the location.
     */
    readonly rooms: RoomInterface[];
}
