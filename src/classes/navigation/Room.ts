import { StoredClassModel } from "@drincs/pixi-vn";
import { getActivityById } from "../../decorators";
import { GraphicItemType } from "../../types/GraphicItem";
import ActivityBaseModel from "../Activity";
import LocationBaseModel from "./Location";

const ROOM_PREFIX = "__NQTR-Room__"

export interface RoomBaseModelProps<TActivity extends ActivityBaseModel> {
    /**
     * The name
     */
    name?: string
    /**
     * The background. Can be a string or an object with keys for different screen sizes.
     * Then define it as an object in order to manage multiple backgrounds, for example to have a background based on time.
     * @example
     * ```ts
     * {
     *    "morning": "morning-background.jpg",
     *    "afternoon": "afternoon-background.jpg",
     *    "evening": "evening-background.jpg",
     *    "night": "night-background.jpg"
     * }
     * ```
     */
    background?: string | { [key: string]: string }
    /**
     * The activities that are available
     */
    defaultActivities?: TActivity[],
    /**
     * Whether is disabled
     */
    disabled?: boolean
    /**
     * Whether is hidden
     */
    hidden?: boolean
    /**
     * The icon element. Can be a string or an HTMLElement or a CanvasItem
     */
    iconElement?: GraphicItemType
}

export default class RoomBaseModel<TLocation extends LocationBaseModel = LocationBaseModel, TActivity extends ActivityBaseModel = ActivityBaseModel> extends StoredClassModel {
    constructor(id: string, location: TLocation, props: RoomBaseModelProps<TActivity>) {
        super(ROOM_PREFIX + id)
        this._location = location
        this.defaultName = props.name || ""
        this.defaultBackground = props.background
        this.defaultActivities = props.defaultActivities || []
        this.defaultDisabled = props.disabled || false
        this.defaultHidden = props.hidden || false
        this._iconElement = props.iconElement
    }

    private _location: TLocation
    get location(): TLocation {
        return this._location
    }

    private defaultName: string
    get name(): string {
        return this.getStorageProperty<string>("name") || this.defaultName
    }
    set name(value: string) {
        this.updateStorageProperty("name", value)
    }

    private defaultBackground?: string | { [key: string]: string }
    get background(): string | { [key: string]: string } | undefined {
        return this.getStorageProperty<string>("background") || this.defaultBackground
    }
    set background(value: string | { [key: string]: string } | undefined) {
        this.updateStorageProperty("background", value)
    }

    private defaultActivities: TActivity[]
    get defaultActivityIds(): string[] {
        return this.defaultActivities.map(activity => activity.id)
    }
    addAdditionalActivity(activity: TActivity) {
        let activityIds = this.getStorageProperty<string[]>("additional_activities") || []
        if (activityIds.includes(activity.id) || this.defaultActivityIds.includes(activity.id)) {
            console.warn(`[NQTR] Activity id ${activity.id} already exists in room ${this.id}`)
            return
        }
        activityIds.push(activity.id)
        this.updateStorageProperty("additional_activities", activityIds)
    }
    removeAdditionalActivity(activity: TActivity) {
        let activityIds = this.getStorageProperty<string[]>("additional_activities") || []
        if (!activityIds.includes(activity.id)) {
            console.warn(`[NQTR] Activity id ${activity.id} does not exist in room ${this.id}`)
            return
        }
        activityIds = activityIds.filter(id => id !== activity.id)
        this.updateStorageProperty("additional_activities", activityIds)
    }
    get additionalActivities(): TActivity[] {
        let activityIds = this.getStorageProperty<string[]>("additional_activities") || []
        return activityIds.map(id => getActivityById<TActivity>(id)).filter(activity => activity !== undefined)
    }
    set additionalActivities(value: TActivity[]) {
        let activityIds = value.map(activity => activity.id)
        this.updateStorageProperty("additional_activities", activityIds)
    }
    get activities(): TActivity[] {
        return this.defaultActivities.concat(this.additionalActivities)
    }

    private defaultDisabled: boolean
    get disabled(): boolean {
        return this.getStorageProperty<boolean>("disabled") || this.defaultDisabled
    }
    set disabled(value: boolean) {
        this.updateStorageProperty("disabled", value)
    }

    private defaultHidden: boolean
    get hidden(): boolean {
        return this.getStorageProperty<boolean>("hidden") || this.defaultHidden
    }
    set hidden(value: boolean) {
        this.updateStorageProperty("hidden", value)
    }

    private _iconElement?: GraphicItemType
    get iconElement(): GraphicItemType | undefined {
        return this._iconElement
    }
}
