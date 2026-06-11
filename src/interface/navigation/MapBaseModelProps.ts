import type { ActivityInterface } from "@/interface";

export default interface MapBaseModelProps {
    /**
     * The name
     * @default ""
     */
    name?: string;
    /**
     * The image of the map.
     * @default undefined
     */
    image?: string;
    /**
     * The activities that are available in this map.
     * @default []
     */
    activities?: ActivityInterface[];
}
