import { storage } from "@drincs/pixi-vn/storage";
import { LocationBaseModelProps, MapInterface } from "../../interface";
import { LocationInternalInterface } from "../../interface/navigation/LocationInterface";
import LocationStoredClass from "./LocationStoredClass";

/**
 * The base model of a location. I suggest you extend this class to create your own location model.
 * @example
 * ```typescript
 * export const mcHome = new LocationBaseModel('mc_home', mainMap, {
 *     name: 'MC Home',
 *     icon: "https://icon.jpg",
 * });
 * ```
 */
export default class LocationBaseModel extends LocationStoredClass implements LocationInternalInterface {
    /**
     * @param id The id of the location, it must be unique.
     * @param map The map where the location is.
     * @param props The properties of the location.
     */
    constructor(id: string, map: MapInterface, props: LocationBaseModelProps = {}) {
        super(id, map, props.activities || []);
        this.defaultName = props.name || "";
        this.defaultDisabled = props.disabled || false;
        this.defaultHidden = props.hidden || false;
        this._icon = props.icon;
    }

    private defaultName: string;
    /**
     * The name of the location.
     * If you set undefined, it will return the initial value of name.
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
     * The icon of the location.
     */
    get icon(): string | undefined {
        return this._icon;
    }
}
