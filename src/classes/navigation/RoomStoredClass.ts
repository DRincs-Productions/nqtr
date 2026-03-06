import { routine } from "@drincs/nqtr/handlers";
import type { CharacterInterface } from "@drincs/pixi-vn";
import { ActivityInterface, CommitmentInterface, LocationInterface } from "../../interface";
import { RoomBaseInternalInterface } from "../../interface/navigation/RoomInterface";
import { OnRunAsyncFunction } from "../../types";
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
    get routine(): CommitmentInterface[] {
        return routine.roomCommitments[this.id] || [];
    }

    get location(): LocationInterface {
        return this._location;
    }

    get characters(): CharacterInterface[] {
        let characters: CharacterInterface[] = [];
        this.routine.forEach((commitment) => {
            characters.push(...commitment.characters);
        });
        return characters;
    }

    get automaticFunctions(): OnRunAsyncFunction[] {
        return this.routine.reduce((acc: OnRunAsyncFunction[], commitment) => {
            if (commitment.executionType === "automatic" && commitment.run) {
                const res: OnRunAsyncFunction = async (props) => {
                    await commitment.run(props);
                };
                acc.push(res);
            }
            return acc;
        }, []);
    }
}
