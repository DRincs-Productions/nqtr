import { ActivityInterface, LocationInterface, RoomInterface } from "../../interface"
import NavigationAbstractClass from "./NavigationAbstractClass"

const ROOM_CATEGORY = "__nqtr-room__"
export default class RoomStoredClass extends NavigationAbstractClass implements RoomInterface {
    constructor(
        id: string,
        /**
         * The location where the room is.
         */
        private readonly _location: LocationInterface,
        activities: ActivityInterface[] = []
    ) {
        super(ROOM_CATEGORY, id, activities)
    }

    get location(): LocationInterface {
        return this._location
    }
}
