export interface OnRunProps {}

/**
 * The function that is called when the class is runned.
 */
export type OnRunEvent<T> = (item: T, props: OnRunProps) => any | Promise<any>;
export type OnRunFunction = (props: OnRunProps) => any | Promise<any>;
export type OnRunAsyncFunction = (props: OnRunProps) => Promise<any>;
