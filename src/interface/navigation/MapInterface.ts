import type NavigationAbstractInterface from "@/interface/navigation/NavigationAbstractClass";
import type { LocationInterface, MapInterface as OverrideMapInterface } from "@drincs/nqtr";

export default interface MapInterface extends MapBaseInternalInterface, OverrideMapInterface {}

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
