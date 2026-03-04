import DateSchedulingInterface from "../DateSchedulingInterface";
import TimeSchedulingInterface from "../TimeSchedulingInterface";

export default interface ActiveScheduling {
    timeSlot?: Partial<TimeSchedulingInterface>[] | Partial<TimeSchedulingInterface>;
    dateScheduling?: Partial<DateSchedulingInterface>;
}
