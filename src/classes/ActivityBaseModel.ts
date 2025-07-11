import { storage } from "@drincs/pixi-vn";
import { ActivityInterface, ActivityProps } from "../interface";
import { OnRunEvent } from "../types/OnRunEvent";
import ActivityStoredClass from "./ActivityStoredClass";

/**
 * The activity model. It is used to create an activity.
 * @example
 * ```tsx
 * export const nap = new ActivityModel("nap",
 *     (_, event) => {
 *         if (event) {
 *             event.navigate("/game")
 *             callLabelWithGoNavigationCallBack(napLabel, event)
 *         }
 *         else {
 *             console.error("Event is undefined")
 *         }
 *     },
 *     {
 *         name: "Nap",
 *         timeSlot: {
 *             from: 5,
 *             to: 23,
 *         },
 *         icon: "https://icon.jpg",
 *     }
 * )
 * ```
 */
export default class ActivityBaseModel extends ActivityStoredClass<ActivityInterface> {
    /**
     * @param id The activity id, that must be unique.
     * @param onRun The function that is called when the activity is runned. Have 2 parameters: the runned activity and the yourParams object, that is an object with the parameters that you want to pass to the onRun function.
     * @param props The activity properties.
     */
    constructor(id: string, onRun: OnRunEvent<ActivityInterface>, props: ActivityProps) {
        super(id, onRun, {
            dateScheduling: props.dateScheduling,
            timeSlot: props.timeSlot,
        });
        this.defaultName = props.name || "";
        this.defaultDisabled = props.disabled || false;
        this.defaultHidden = props.hidden || false;
        this._icon = props.renderIcon;
    }

    private defaultName: string;
    /**
     * The name of the activity.
     */
    get name(): string {
        return this.getStorageProperty<string>("name") || this.defaultName;
    }
    set name(value: string | undefined) {
        this.setStorageProperty("name", value);
    }

    private defaultDisabled: boolean | string;
    /**
     * Whether is disabled. If it is a string, it is a Pixi'VN flag name.
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
     * Whether is hidden. If it is a string, it is a Pixi'VN flag name.
     */
    get hidden(): boolean {
        let value = this.getStorageProperty<boolean>("hidden") || this.defaultHidden;
        if (typeof value === "string") {
            return storage.getFlag(value);
        }
        return value;
    }
    set hidden(value: boolean | string) {
        this.setStorageProperty("hidden", value);
    }

    private _icon?: string;
    /**
     * The icon of the activity.
     */
    get icon(): string | undefined {
        return this._icon;
    }
}
