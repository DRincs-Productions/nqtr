import { GraphicItemType, OnRenderGraphicItemProps, OnStartEndStageQuest } from "@drincs/nqtr/dist/override";
import { getFlag } from "@drincs/pixi-vn";
import { StageProps } from "../../interface";
import StageFlags from "../../interface/quest/StageFlags";
import { timeTracker } from "../../managers";
import { QuestsRequiredType } from "../../types/QuestsRequired";
import StageStoredClass from "./StageStoredClass";

export default class Stage extends StageStoredClass {
	constructor(id: string, props: StageProps) {
		super(id);
		this._name = props.name || "";
		this._flags = props.flags || [];
		this._description = props.description || "";
		this._adviceDescription = props.adviceDescription || "";
		this._renderImage = props.renderImage;
		this._daysRequiredToStart = props.daysRequiredToStart;
		this._flagsRequiredToStart = props.flagsRequiredToStart || [];
		this._questsRequiredToStart = props.questsRequiredToStart || [];
		this._requestDescriptionToStart = props.requestDescriptionToStart || "";
		this._onStart = props.onStart;
		this._onEnd = props.onEnd;
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

	private _renderImage?: GraphicItemType | ((room: Stage, props: OnRenderGraphicItemProps) => GraphicItemType);
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

	// request to start

	private _daysRequiredToStart?: number;
	/**
	 * The number of days required to start the stage.
	 */
	get daysRequiredToStart(): number {
		return this._daysRequiredToStart || 0;
	}

	private _flagsRequiredToStart: StageFlags[];
	/**
	 * The list of flags required to start the stage.
	 */
	get flagsRequiredToStart(): StageFlags[] {
		return this._flagsRequiredToStart;
	}

	private _questsRequiredToStart: QuestsRequiredType[];
	/**
	 * The list of quests required to start the stage.
	 */
	get questsRequiredToStart(): QuestsRequiredType[] {
		return this._questsRequiredToStart || [];
	}

	private _requestDescriptionToStart: string;
	/**
	 * The description of the request to start the stage.
	 */
	get requestDescriptionToStart(): string {
		return this._requestDescriptionToStart;
	}

	// function

	private _onStart?: (stage: Stage, props: OnStartEndStageQuest) => void;
	/**
	 * The function that will be called when the stage starts.
	 */
	get onStart(): undefined | ((stage: Stage, props: OnStartEndStageQuest) => void) {
		return this._onStart;
	}

	private _onEnd?: (stage: Stage, props: OnStartEndStageQuest) => void;
	/**
	 * The function that will be called when the stage ends.
	 */
	get onEnd(): undefined | ((stage: Stage, props: OnStartEndStageQuest) => void) {
		return this._onEnd;
	}
}

export class StageQuest extends Stage {
	constructor(id: string, props: StageProps) {
		super(id, props);
	}

	/**
	 * Check if the flag and goals are completed.
	 * You can force the completion of the stage by setting the completed property to true.
	 */
	get completed(): boolean {
		let storedCompleted = this.getStorageProperty<boolean>("completed");
		if (storedCompleted) {
			return storedCompleted;
		}
		if (this.flags.length > 0) {
			if (!this.flags.every((flag) => getFlag(flag.flag))) {
				return false;
			}
			return true;
		}
		return false;
	}
	set completed(value: boolean) {
		this.setStorageProperty("completed", value);
	}

	/**
	 * If the stage is started.
	 */
	get started(): boolean {
		return this.getStorageProperty<boolean>("started") || false;
	}
	set started(value: boolean) {
		this.setStorageProperty("started", value);
	}

	private get prevStageEndDay(): number | undefined {
		return this.getStorageProperty<number>("prevStageEndDay");
	}
	private set prevStageEndDay(value: number | undefined) {
		this.setStorageProperty("prevStageEndDay", value);
	}

	/**
	 * The day when the stage starts.
	 */
	get startDay(): number | undefined {
		let prevStageEndDay = this.prevStageEndDay;
		if (prevStageEndDay === undefined) {
			return undefined;
		}
		return prevStageEndDay + this.daysRequiredToStart;
	}

	/**
	 * Check if the stage can start.
	 */
	get canStart(): boolean {
		let daysRequired = this.daysRequiredToStart;
		if (daysRequired > 0) {
			let prevStageEndDay = this.prevStageEndDay;
			if (prevStageEndDay === undefined) {
				return false;
			}
			if (prevStageEndDay + daysRequired > timeTracker.currentDay) {
				return false;
			}
		}
		if (this.flagsRequiredToStart.length > 0 && !this.flagsRequiredToStart.every((flag) => getFlag(flag.flag))) {
			return false;
		}
		if (
			this.questsRequiredToStart.length > 0 &&
			!this.questsRequiredToStart.every(
				(q) => q.quest.currentStageIndex && q.quest.currentStageIndex >= q.stageNumber
			)
		) {
			return false;
		}
		return true;
	}

	/**
	 * Inizialize the stage. **This function should be called only by the Quest class.**
	 */
	inizialize() {
		if (this.daysRequiredToStart > 0) {
			this.prevStageEndDay = timeTracker.currentDay;
			console.log(`[NQTR] Stage ${this.id} will start on day ${this.startDay}`);
		}
	}

	/**
	 * The function that will be called when the stage starts.
	 */
	start(props: OnStartEndStageQuest) {
		if (this.canStart) {
			this.started = true;
			if (this.onStart) {
				this.onStart(this, props);
			}
		} else {
			console.warn(`[NQTR] Stage ${this.id} can't start`);
		}
	}
}
