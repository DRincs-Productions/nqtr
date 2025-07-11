import { CharacterInterface } from "@drincs/pixi-vn";
import { CommitmentInterface, RoomInterface } from "../interface";
import { CommitmentBaseInternalInterface } from "../interface/CommitmentInterface";
import DateSchedulingInterface from "../interface/DateSchedulingInterface";
import TimeSchedulingInterface from "../interface/TimeSchedulingInterface";
import { ExecutionType } from "../types";
import { OnRunEvent } from "../types/OnRunEvent";
import ActivityStoredClass from "./ActivityStoredClass";

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
        props: {
            executionType?: ExecutionType;
            priority?: number;
            timeSlot?: TimeSchedulingInterface;
            dateScheduling?: DateSchedulingInterface;
        }
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
