import { ActivityInterface, CommitmentInterface } from "..";

export default interface RoomBaseModelProps {
    /**
     * The name
     * @default ""
     */
    name?: string;
    /**
     * The image of the room.
     * @default undefined
     */
    image?: string;
    /**
     * The activities that are available in this room.
     * @default []
     */
    activities?: ActivityInterface[];
    /**
     * The routine of the room, it is an array of commitments that are executed in the room. You can also add commitments during the game session, but this property is useful to set the initial routine of the room.
     * @default undefined
     */
    routine?: CommitmentInterface[];
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
     * The icon of the room.
     * @default undefined
     */
    icon?: string;
}
