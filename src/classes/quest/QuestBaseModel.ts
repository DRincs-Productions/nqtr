import { QuestProps, StageInterface } from "../../interface";
import QuestStoredClass from "./QuestStoredClass";

export default class QuestBaseModel extends QuestStoredClass {
    constructor(id: string, stages: StageInterface[], props: QuestProps) {
        super(id, stages, {
            onStart: props.onStart,
            onContinue: props.onContinue || props.onNextStage,
        });
        this._name = props.name || "";
        this._description = props.description || "";
        this._icon = props.icon;
        this._image = props.image;
        this._inDevelopment = props.inDevelopment || false;
    }

    private _name: string;
    /**
     * The name of the quest.
     */
    get name(): string {
        return this._name;
    }

    private _description: string;
    /**
     * The description of the quest.
     */
    get description(): string {
        return this._description;
    }

    private _icon?: string;
    /**
     * Icon of the quest.
     */
    get icon(): string | undefined {
        return this._icon;
    }

    private _image?: string;
    /**
     * Image of the quest.
     */
    get image(): string | undefined {
        return this._image;
    }

    private _inDevelopment: boolean;
    /**
     * If the quest is in development.
     */
    get inDevelopment(): boolean {
        return this._inDevelopment;
    }
}
