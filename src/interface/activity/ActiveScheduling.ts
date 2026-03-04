import DateSchedulingInterface from "../DateSchedulingInterface";
import TimeSchedulingInterface from "../TimeSchedulingInterface";

export default interface ActiveScheduling {
    timeSlot?: TimeSchedulingInterface[] | TimeSchedulingInterface;
    dateScheduling?: DateSchedulingInterface;
}
