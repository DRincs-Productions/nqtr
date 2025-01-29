import { OnRunProps as OnRunPropsOverride } from "@drincs/nqtr";

export type OnRunProps = OnRunPropsOverride;

/**
 * The function that is called when the class is runned.
 */
export type OnRunEvent<T> = (item: T, props: OnRunProps) => void;
