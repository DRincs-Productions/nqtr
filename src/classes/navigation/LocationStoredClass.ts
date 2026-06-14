import NavigationAbstractClass from "@/classes/navigation/NavigationAbstractClass";
import type { ActivityIdType, ActivityInterface, MapInterface, RoomInterface } from "@/interface";
import type { LocationInternalInterface } from "@/interface/navigation/LocationInterface";
import { navigator } from "@drincs/nqtr/handlers";

const LOCATION_CATEGORY = "__nqtr-location__";
export default class LocationStoredClass
    extends NavigationAbstractClass
    implements LocationInternalInterface
{
    constructor(
        id: string,
        /**
         * The map where the location is.
         */
        private readonly _map: MapInterface,
        activities: (ActivityInterface | ActivityIdType)[] = [],
    ) {
        super(LOCATION_CATEGORY, id, activities);
    }

    get map(): MapInterface {
        return this._map;
    }

    get rooms(): RoomInterface[] {
        return navigator.rooms.filter((room) => room.location.id === this.id);
    }
}
