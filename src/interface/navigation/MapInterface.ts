import type LocationInterface from "@/interface/navigation/LocationInterface";
import type NavigationAbstractInterface from "@/interface/navigation/NavigationAbstractClass";

export default interface MapInterface extends MapBaseInternalInterface {}

export interface MapBaseInternalInterface extends NavigationAbstractInterface {
    /**
     * The id of the map.
     */
    readonly id: string;
    /**
     * Get all locations in the map.
     * @returns The locations in the map.
     */
    readonly locations: LocationInterface[];
}
