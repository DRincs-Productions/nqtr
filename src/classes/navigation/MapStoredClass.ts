import NavigationAbstractClass from "@/classes/navigation/NavigationAbstractClass";
import type { ActivityInterface, LocationInterface } from "@/interface";
import type { MapBaseInternalInterface } from "@/interface/navigation/MapInterface";
import { navigator } from "@drincs/nqtr/handlers";

const MAP_CATEGORY = "__nqtr-map__";
export default class MapStoredClass
    extends NavigationAbstractClass
    implements MapBaseInternalInterface
{
    constructor(id: string, activities: ActivityInterface[] = []) {
        super(MAP_CATEGORY, id, activities);
    }

    get locations(): LocationInterface[] {
        return navigator.locations.filter((location) => location.map.id === this.id);
    }
}
