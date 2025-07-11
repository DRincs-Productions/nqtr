import { StageInterface } from "..";
import { OnRunEvent, QuestsRequiredType } from "../../types";
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
     * The number of day/date required to start the stage.
     * @example If the value is 3, and the previous stage ends on date 1, the stage will start on date 4.
     */
    deltaDateRequired?: number;
    /**
     * The flags required to start the stage.
     * @default []
     */
    flagsRequired?: StageFlags[];
    /**
     * The quests required to start the stage.
     * @default []
     */
    questsRequired?: QuestsRequiredType[];
    /**
     * The description to request to start the stage.
     * @default ""
     */
    requestDescriptionToStart?: string;
    /**
     * The function that will be executed when the stage starts.
     */
    onStart?: OnRunEvent<StageInterface>;
    /**
     * The function that will be executed when the stage ends.
     */
    onEnd?: OnRunEvent<StageInterface>;
}
