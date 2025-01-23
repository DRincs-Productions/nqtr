import { GraphicItemType, OnRenderGraphicItemProps } from "@drincs/nqtr/dist/override";
import { getFlag } from "@drincs/pixi-vn";
import { StageProps } from "../../interface";
import StageFlags from "../../interface/quest/StageFlags";
import StageStoredClass from "./StageStoredClass";

export default class StageBaseModel extends StageStoredClass {
	constructor(id: string, props: StageProps) {
		super(id, {
			onStart: props.onStart,
			onEnd: props.onEnd,
			daysRequiredToStart: props.daysRequiredToStart,
			questsRequiredToStart: props.questsRequiredToStart,
		});
		this._name = props.name || "";
		this._flags = props.flags || [];
		this._description = props.description || "";
		this._adviceDescription = props.adviceDescription || "";
		this._renderImage = props.renderImage;
		this._flagsRequiredToStart = props.flagsRequiredToStart || [];
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

	private _renderImage?:
		| GraphicItemType
		| ((room: StageBaseModel, props: OnRenderGraphicItemProps) => GraphicItemType);
	/**
	 * The function for rendering the image of the stage.
	 */
	get renderImage(): ((props: OnRenderGraphicItemProps) => GraphicItemType) | undefined {
		let render = this._renderImage;
		if (render === undefined) {
			return undefined;
		}
		if (typeof render === "function") {
			return (props: OnRenderGraphicItemProps) => {
				return render(this, props);
			};
		}
		return (props: OnRenderGraphicItemProps) => render;
	}

	private _flags: StageFlags[];
	/**
	 * The list of flags that the player must complete to finish the stage.
	 */
	get flags(): StageFlags[] {
		return this._flags;
	}

	private _flagsRequiredToStart: StageFlags[];
	/**
	 * The list of flags required to start the stage.
	 */
	get flagsRequiredToStart(): StageFlags[] {
		return this._flagsRequiredToStart;
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
			if (!this.flags.every((flag) => getFlag(flag.flag))) {
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
		if (this.flagsRequiredToStart.length > 0 && !this.flagsRequiredToStart.every((flag) => getFlag(flag.flag))) {
			return false;
		}
		return super.canStart;
	}
}
