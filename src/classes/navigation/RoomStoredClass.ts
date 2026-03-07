import { routine, timeTracker } from "@drincs/nqtr/handlers";
import { fixedCommitments } from "@drincs/nqtr/registries";
import { type CharacterInterface } from "@drincs/pixi-vn";
import { PixiError } from "@drincs/pixi-vn/core";
import { ActiveScheduling, ActivityInterface, CommitmentInterface, LocationInterface } from "../../interface";
import { RoomBaseInternalInterface } from "../../interface/navigation/RoomInterface";
import { OnRunAsyncFunction } from "../../types";
import { logger } from "../../utils/log-utility";
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
              } = [],
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
    addCommitment(commitment: CommitmentInterface, options: ActiveScheduling = {}) {
        let { timeSlot, dateScheduling } = options;
        if (timeSlot && !Array.isArray(timeSlot)) {
            timeSlot = [timeSlot];
        }
        timeSlot?.forEach((timeSlot) => {
            const { to: toTime = timeTracker.dayEndTime + 1 } = timeSlot || {};
            if (timeSlot) {
                if (timeSlot.from >= toTime) {
                    logger.error(`The from time must be less than the to time.`);
                    throw new PixiError("invalid_usage", `The from time must be less than the to time.`);
                }
            }
        });
        if (
            dateScheduling?.from !== undefined &&
            dateScheduling?.to !== undefined &&
            dateScheduling?.from >= dateScheduling?.to
        ) {
            logger.error(`The from day/date must be less than the to day/date.`);
            throw new PixiError("invalid_usage", `The from day/date must be less than the to day/date.`);
        }

        routine.add(commitment, this.id, {
            timeSlot: timeSlot,
            dateScheduling: dateScheduling,
        });
    }
    removeCommitment(commitment: CommitmentInterface | string) {
        routine.remove(commitment, this.id);
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
