import DateSchedulingInterface from "./DateSchedulingInterface";
import TimeSchedulingInterface from "./TimeSchedulingInterface";

export default interface ActivityProps {
    /**
     * The name
     * @default ""
     */
    name?: string;
    /**
     * Time slot in which activity/commitment will be active.
     */
    timeSlot?: TimeSchedulingInterface;
    /**
     * Used to schedule what date it will be added and removed.
     */
    dateScheduling?: DateSchedulingInterface;
    /**
     * Whether is disabled. You can also pass a Pixi'VN flag name.
     * @default false
     */
    disabled?: boolean | string;
    /**
     * Whether is hidden. You can also pass a Pixi'VN flag name.
     * @default false
     */
    hidden?: boolean | string;
    /**
     * The icon of the activity.
     * @default undefined
     */
    renderIcon?: string;
}
