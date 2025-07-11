import { storage } from "@drincs/pixi-vn";
import { StageProps } from "../../interface";
import StageFlags from "../../interface/quest/StageFlags";
import StageStoredClass from "./StageStoredClass";

export default class StageBaseModel extends StageStoredClass {
    constructor(id: string, props: StageProps) {
        super(id, {
            onStart: props.onStart,
            onEnd: props.onEnd,
            deltaDateRequired: props.deltaDateRequired,
            questsRequired: props.questsRequired,
        });
        this._name = props.name || "";
        this._flags = props.flags || [];
        this._description = props.description || "";
        this._adviceDescription = props.adviceDescription || "";
        this._image = props.image;
        this._flagsRequired = props.flagsRequired || [];
        this._requestDescriptionToStart = props.requestDescriptionToStart || "";
    }

    private _name: string;
    /**
     * The name of the stage.
     */
    get name(): string {
        return this._name;
    }

    private _description: string;
    /**
     * The description of the stage.
     */
    get description(): string {
        return this._description;
    }

    private _adviceDescription: string;
    /**
     * The advice description of the stage.
     */
    get adviceDescription(): string {
        return this._adviceDescription;
    }

    private _image?: string;
    /**
     * The image of the stage.
     */
    get image(): string | undefined {
        return this._image;
    }

    private _flags: StageFlags[];
    /**
     * The list of flags that the player must complete to finish the stage.
     */
    get flags(): StageFlags[] {
        return this._flags;
    }

    private _flagsRequired: StageFlags[];
    /**
     * The list of flags required to start the stage.
     */
    get flagsRequired(): StageFlags[] {
        return this._flagsRequired;
    }

    private _requestDescriptionToStart: string;
    /**
     * The description of the request to start the stage.
     */
    get requestDescriptionToStart(): string {
        return this._requestDescriptionToStart;
    }

    override get completed(): boolean {
        if (super.completed) {
            return true;
        }
        if (this.flags.length > 0) {
            if (!this.flags.every((flag) => storage.getFlag(flag.flag))) {
                return false;
            }
            return true;
        }
        return false;
    }
    override set completed(value: boolean) {
        super.completed = value;
    }
    override get canStart(): boolean {
        if (this.flagsRequired.length > 0 && !this.flagsRequired.every((flag) => storage.getFlag(flag.flag))) {
            return false;
        }
        return super.canStart;
    }
}
