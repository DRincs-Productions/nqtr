export default interface TimeSchedulingInterface {
    /**
     * The time when the item starts. If the item is not started yet, it will be hidden.
     * If you set 3, the item will be hidden into times 1 and 2, and will be shown from time 3.
     */
    from: number;
    /**
     * The time when the item ends. If the item is ended yet, it will be hidden.
     * If you set 3, the item will be shown into times 1 and 2 and will be hidden from time 3.
     * @default timeTracker.dayEndTime + 1
     */
    to?: number;
}
