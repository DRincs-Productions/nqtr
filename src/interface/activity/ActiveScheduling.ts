import DateSchedulingInterface from "../DateSchedulingInterface";
import TimeSchedulingInterface from "../TimeSchedulingInterface";

export default interface ActiveScheduling {
    /**
     * Time slot in which activity/commitment will be active.
     */
    readonly timeSlot?: TimeSchedulingInterface[] | TimeSchedulingInterface;
    /**
     * Used to schedule what date it will be added and removed.
     */
    readonly dateScheduling?: DateSchedulingInterface;
}

export interface ExcludedScheduling {}
