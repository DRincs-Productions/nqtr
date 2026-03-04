import { routine } from "@drincs/nqtr/handlers";
import type { CharacterInterface } from "@drincs/pixi-vn";
import { ActivityInterface, LocationInterface } from "../../interface";
import { RoomBaseInternalInterface } from "../../interface/navigation/RoomInterface";
import { OnRunAsyncFunction } from "../../types";
import CommitmentStoredClass from "../CommitmentStoredClass";
import NavigationAbstractClass from "./NavigationAbstractClass";

const ROOM_CATEGORY = "__nqtr-room__";
export default class RoomStoredClass extends NavigationAbstractClass implements RoomBaseInternalInterface {
    constructor(
        id: string,
        /**
         * The location where the room is.
         */
        private readonly _location: LocationInterface,
        activities: ActivityInterface[] = [],
    ) {
        super(ROOM_CATEGORY, id, activities);
    }

    get location(): LocationInterface {
        return this._location;
    }

    get characters(): CharacterInterface[] {
        return this.activities.reduce((acc: CharacterInterface[], commitment) => {
            if (commitment instanceof CommitmentStoredClass) {
                acc.push(...commitment.characters);
            }
            return acc;
        }, []);
    }

    get automaticFunctions(): OnRunAsyncFunction[] {
        return this.activities.reduce((acc: OnRunAsyncFunction[], commitment) => {
            if (
                commitment instanceof CommitmentStoredClass &&
                commitment.executionType === "automatic" &&
                commitment.run
            ) {
                const res: OnRunAsyncFunction = async (props) => {
                    await commitment.run(props);
                };
                acc.push(res);
            }
            return acc;
        }, []);
    }

    override get activities(): ActivityInterface[] {
        return routine.filterActivitiesByCharacterAvailability(super.activities);
    }
}
