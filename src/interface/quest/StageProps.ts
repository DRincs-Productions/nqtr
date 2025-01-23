import { OnStartEndStageQuest } from "@drincs/nqtr/dist/override";
import { StageInterface } from "..";
import { QuestsRequiredType } from "../../types";
import StageFlags from "./StageFlags";

export default interface StageProps {
	/**
	 * The flags of the stage.
	 * @default []
	 */
	flags?: StageFlags[];
	/**
	 * The name of the stage.
	 * @default ""
	 */
	name?: string;
	/**
	 * The description of the stage.
	 * @default ""
	 */
	description?: string;
	/**
	 * The advice description of the stage.
	 * @default ""
	 */
	adviceDescription?: string;
	/**
	 * The image of the stage.
	 */
	image?: string;
	/**
	 * The day required to start the stage.
	 * @example If the value is 3, and the previous stage ends on day 1, the stage will start on day 4.
	 */
	daysRequiredToStart?: number;
	/**
	 * The flags required to start the stage.
	 * @default []
	 */
	flagsRequiredToStart?: StageFlags[];
	/**
	 * The quests required to start the stage.
	 * @default []
	 */
	questsRequiredToStart?: QuestsRequiredType[];
	/**
	 * The description to request to start the stage.
	 * @default ""
	 */
	requestDescriptionToStart?: string;
	/**
	 * The function that will be executed when the stage starts.
	 */
	onStart?: (stage: StageInterface, props: OnStartEndStageQuest) => void;
	/**
	 * The function that will be executed when the stage ends.
	 */
	onEnd?: (stage: StageInterface, props: OnStartEndStageQuest) => void;
}
