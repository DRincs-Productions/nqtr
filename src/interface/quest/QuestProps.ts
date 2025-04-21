import { QuestInterface } from "..";
import { OnRunEvent } from "../../types";

export default interface QuestProps {
    /**
     * The name of the quest.
     * @default ""
     */
    name?: string;
    /**
     * The description of the quest.
     * @default ""
     */
    description?: string;
    /**
     * The icon of the quest.
     * @default undefined
     */
    icon?: string;
    /**
     * The image of the quest.
     */
    image?: string;
    /**
     * If the quest is in development.
     * @default false
     */
    inDevelopment?: boolean;
    /**
     * The function that will be executed when the quest starts.
     */
    onStart?: OnRunEvent<QuestInterface>;
    /**
     * The function that will be executed when a stage end in the quest.
     */
    onNextStage?: OnRunEvent<QuestInterface>;
}
