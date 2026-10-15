/** biome-ignore-all lint/suspicious/noEmptyInterface: <explanation> */

/**
 * Object passed to the functions triggered by the system (e.g. {@link OnRunEvent}),
 * allowing you to customize and access properties inside them.
 *
 * By default it is an empty interface. You can override it in your `.d.ts` file
 * (module augmentation) to specify the required properties.
 *
 * @example
 * ```ts title="nqtr.d.ts"
 * import "@drincs/nqtr";
 *
 * declare module "@drincs/nqtr" {
 *     interface OnRunProps {
 *         navigate: (route: string) => void;
 *     }
 * }
 * ```
 */
export interface OnRunProps {}

/**
 * The function that is called when the class is runned.
 */
export type OnRunEvent<T> = (item: T, props: OnRunProps) => any | Promise<any>;
export type OnRunFunction = (props: OnRunProps) => any | Promise<any>;
export type OnRunAsyncFunction = (props: OnRunProps) => Promise<any>;
