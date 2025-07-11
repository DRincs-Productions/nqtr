import { CommitmentInterface } from ".";
import { ExecutionType } from "../types";
import { OnRunEvent } from "../types/OnRunEvent";
import DateSchedulingInterface from "./DateSchedulingInterface";
import TimeSchedulingInterface from "./TimeSchedulingInterface";

export default interface CommitmentProps {
    /**
     * The name
     * @default ""
     */
    name?: string;
    /**
     * Time slot in which activity/commitment will be active.
     */
    readonly timeSlot: TimeSchedulingInterface | undefined;
    /**
     * Used to schedule what date it will be added and removed.
     */
    readonly dateScheduling: DateSchedulingInterface | undefined;
    /**
     * The image ofthe Commitment.
     */
    image?: string;
    /**
     * Execution type. If is "automatic" the onRun() runned automatically when the palayer is in the room. If is "interaction" the player must interact with the character to run the onRun() function.
     * If you set "automatic" remember to remove the commitment when it is no longer needed, because otherwise it repeats itself every time.
     * @default "interaction"
     */
    executionType?: ExecutionType;
    /**
     * Is a function that is called when the player interacts with the character.
     * @param commitment
     * @returns
     * @default undefined
     */
    onRun?: OnRunEvent<CommitmentInterface>;
    /**
     * Whether is disabled. You can also pass a Pixi'VN flag name.
     * If it is disabled this commitment will not be taken into consideration. So the characters will not be in the room, but will be busy with other commitments.
     * @default false
     */
    disabled?: boolean | string;
    /**
     * Whether is hidden. You can also pass a Pixi'VN flag name.
     * @default false
     */
    hidden?: boolean | string;
    /**
     * The icon of the commitment.
     */
    icon?: string;
    /**
     * The priority. The higher the number, the higher the priority.
     * To ensure that a character is not in 2 places at the same time, if there are 2 or more valid commits at the same time and with the same character, the one with the highest priority will be chosen.
     * @default 0
     */
    priority?: number;
}
