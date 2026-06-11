import type { MapInterface } from "@/interface";
import type NavigationAbstractInterface from "@/interface/navigation/NavigationAbstractClass";
import type { LocationInterface as OverrideLocationInterface, RoomInterface } from "@drincs/nqtr";

export default interface LocationInterface
    extends LocationInternalInterface,
        OverrideLocationInterface {}

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
