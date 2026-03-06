import { routine } from "@drincs/nqtr/handlers";
import { fixedCommitments } from "@drincs/nqtr/registries";
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
        activities:
            | ActivityInterface[]
            | {
                  activities: ActivityInterface[];
                  routine: CommitmentInterface[];
              },
    ) {
        if (Array.isArray(activities)) {
            super(ROOM_CATEGORY, id, activities);
        } else {
            super(ROOM_CATEGORY, id, activities.activities);
            activities.routine.forEach((commitment) => fixedCommitments.set(commitment.id, [commitment, id]));
        }
    }
    get routine(): CommitmentInterface[] {
        return routine.roomCommitments[this.id] || [];
    }

    get location(): LocationInterface {
        return this._location;
    }

    get characters(): CharacterInterface[] {
        return this.routine.reduce((acc: CharacterInterface[], commitment) => {
            acc.push(...commitment.characters);
            return acc;
        }, []);
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
