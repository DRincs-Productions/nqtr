import { CharacterInterface } from "@drincs/pixi-vn";
import { CommitmentInterface, RoomInterface } from "../interface";
import { CommitmentBaseInternalInterface } from "../interface/CommitmentInterface";
import DateSchedulingInterface from "../interface/DateSchedulingInterface";
import TimeSchedulingInterface from "../interface/TimeSchedulingInterface";
import { ExecutionType } from "../types";
import { OnRunEvent } from "../types/OnRunEvent";
import ActivityStoredClass from "./ActivityStoredClass";

export interface CommitmentStoredClassProps {
    /**
     * Execution type. If is "automatic" the onRun() runned automatically when the palayer is in the room. If is "interaction" the player must interact with the character to run the onRun() function.
     * If you set "automatic" remember to remove the commitment when it is no longer needed, because otherwise it repeats itself every time.
     */
    executionType?: ExecutionType;
    /**
     * The priority. The higher the number, the higher the priority.
     * To ensure that a character is not in 2 places at the same time, if there are 2 or more valid commits at the same time and with the same character, the one with the highest priority will be chosen.
     */
    priority?: number;
    /**
     * Time slot in which activity/commitment will be active.
     */
    timeSlot?: TimeSchedulingInterface;
    /**
     * Used to schedule what date it will be added and removed.
     */
    dateScheduling?: DateSchedulingInterface;
}

const COMMITMENT_CATEGORY = "__nqtr-commitment__";
export default class CommitmentStoredClass
    extends ActivityStoredClass<CommitmentInterface>
    implements CommitmentBaseInternalInterface
{
    constructor(
        id: string,
        private readonly _characters: CharacterInterface[],
        private readonly _room: RoomInterface,
        onRun: OnRunEvent<CommitmentInterface> | undefined,
        props: CommitmentStoredClassProps
    ) {
        onRun = onRun || (() => {});
        super(id, onRun, props, COMMITMENT_CATEGORY);
        this.defaultExecutionType = props.executionType || "interaction";
        this.defaultPriority = props.priority;
    }
    private readonly defaultExecutionType: ExecutionType;
    private readonly defaultPriority?: number;

    get characters(): CharacterInterface[] {
        return this._characters;
    }

    get room(): RoomInterface {
        return this._room;
    }

    get executionType(): ExecutionType {
        return this.getStorageProperty<ExecutionType>("executionType") || this.defaultExecutionType;
    }
    set executionType(value: ExecutionType) {
        this.setStorageProperty("executionType", value);
    }

    get priority(): number {
        return this.getStorageProperty<number>("priority") || this.defaultPriority || 0;
    }
    set priority(value: number) {
        this.setStorageProperty("priority", value);
    }
}
