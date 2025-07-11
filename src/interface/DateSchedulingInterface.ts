export default interface DateSchedulingInterface {
    /**
     * The start date. If the item hasn't started yet, it will be hidden.
     * If you set it to 3, the item will be hidden on dates 1 and 2 and will be shown starting on date 3.
     */
    from: number;
    /**
     * The date when the item ends. If the item is ended yet, it will be deleted or hidden.
     * If you set { from: 0, to: 3 }, the item will be shown into dates 1 and 2 and will be deleted or hidden from date 3.
     * @default undefined
     */
    to?: number;
}
