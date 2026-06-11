import type { TimeSlotInterface } from "@/types/TimeSettings";

const TimeHandlerSettings = {
    dayStartTime: 0,
    dayEndTime: 24,
    defaultTimeSpent: 1,
    timeSlots: [] as TimeSlotInterface[],
    weekLength: 7,
    weekendStartDay: 6,
    getDayName: undefined as ((weekDayNumber: number) => string) | undefined,
};

export default TimeHandlerSettings;
