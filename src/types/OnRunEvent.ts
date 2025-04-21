import { OnRunProps as OnRunPropsOverride } from "@drincs/nqtr";

export type OnRunProps = OnRunPropsOverride;

/**
 * The function that is called when the class is runned.
 */
export type OnRunEvent<T> = (item: T, props: OnRunProps) => void | Promise<void>;
export type OnRunFunction = (props: OnRunProps) => void | Promise<void>;
export type OnRunAsyncFunction = (props: OnRunProps) => Promise<void>;
