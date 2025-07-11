import { CharacterInterface, storage } from "@drincs/pixi-vn";
import { CommitmentProps, RoomInterface } from "../interface";
import { timeTracker } from "../managers";
import CommitmentStoredClass from "./CommitmentStoredClass";

/**
 * The base model of a commitment. I suggest you extend this class to create your own commitment model.
 * You must use the saveRoom function to save the commitment in the registered commitments.
 * @example
 * ```ts
 * export const mcRoom = new CommitmentBaseModel("test", character, room, {
 *     name: "Test",
 *     image: "https://image.jpg",
 *     executionType: ExecutionTypeEnum.INTERACTION,
 *     onRun: (commitment) => {
 *         // Do something
 *     }
 * })
 * saveCommitment(mcRoom)
 * ```
 */
export default class CommitmentBaseModel extends CommitmentStoredClass {
    /**
     * @param id The id of the commitment, it must be unique.
     * @param character The character or characters that are in the commitment and so in the room.
     * @param room The room where the commitment is.
     * @param props The properties of the commitment.
     */
    constructor(
        id: string,
        character: CharacterInterface | CharacterInterface[] | undefined,
        room: RoomInterface,
        props: CommitmentProps
    ) {
        super(id, character ? (Array.isArray(character) ? character : [character]) : [], room, props.onRun, {
            executionType: props.executionType,
            priority: props.priority,
            fromHour: props.fromHour,
            toHour: props.toHour,
            fromDay: props.fromDay,
            toDay: props.toDay,
        });
        this._name = props.name || "";
        this._image = props.image;
        this.defaultDisabled = props.disabled || false;
        this.defaultHidden = props.hidden || false;
        this._icon = props.icon;
    }

    private _name: string;
    /**
     * The name of the commitment.
     */
    get name(): string {
        return this._name;
    }

    private _image?: string;
    /**
     * The image of the commitment.
     */
    get image(): string | undefined {
        return this._image;
    }

    private _icon?: string;
    /**
     * The icon of the commitment.
     */
    get icon(): string | undefined {
        return this._icon;
    }

    private defaultDisabled: boolean | string;
    /**
     * Whether is disabled. You can also pass a Pixi'VN flag name.
     */
    get disabled(): boolean {
        let value = this.getStorageProperty<boolean>("disabled") || this.defaultDisabled;
        if (typeof value === "string") {
            return storage.getFlag(value);
        }
        return value;
    }
    set disabled(value: boolean | string) {
        this.setStorageProperty("disabled", value);
    }

    private defaultHidden: boolean | string;
    /**
     * Whether is hidden. You can also pass a Pixi'VN flag name.
     */
    get hidden(): boolean {
        if (this.fromDay && this.fromDay > timeTracker.currentDate) {
            return true;
        }
        if (!timeTracker.nowIsBetween(this.fromHour, this.toHour)) {
            return true;
        }
        if (!this.expired) {
            return true;
        }
        let value = this.getStorageProperty<boolean>("hidden") || this.defaultHidden;
        if (typeof value === "string") {
            return storage.getFlag(value);
        }
        return value;
    }
    set hidden(value: boolean | string) {
        this.setStorageProperty("hidden", value);
    }
}
