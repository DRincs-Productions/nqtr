import type { ActivityIdType, ActivityInterface } from "@/interface";

export default interface LocationBaseModelProps {
    /**
     * The name
     * @default ""
     */
    name?: string;
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
     * The icon of the location.
     * @default undefined
     */
    icon?: string;
    /**
     * The activities that are available in this location.
     * @default []
     */
    activities?: (ActivityInterface | ActivityIdType)[];
}
