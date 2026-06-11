import { MapBaseModelProps } from "../../interface";
import { MapBaseInternalInterface } from "../../interface/navigation/MapInterface";
import MapStoredClass from "./MapStoredClass";

/**
 * The base model of a map. I suggest you extend this class to create your own map model.
 * @example
 * ```typescript
 * export const mainMap = new MapBaseModel('main_map', {
 *     name: 'Main Map',
 *     image: "https://image.jpg",
 * });
 * ```
 */
export default class MapBaseModel extends MapStoredClass implements MapBaseInternalInterface {
    /**
     * @param id The id of the map, it must be unique.
     * @param props The properties of the map.
     */
    constructor(id: string, props: MapBaseModelProps = {}) {
        super(id, props.activities || []);
        this.defaultName = props.name || "";
        this._image = props.image;
    }

    private defaultName: string;
    /**
     * The name of the map.
     * If you set undefined, it will return the initial value of name.
     */
    get name(): string {
        return this.getStorageProperty<string>("name") || this.defaultName;
    }
    set name(value: string | undefined) {
        this.setStorageProperty("name", value);
    }

    private _image?: string;
    /**
     * The image of the map.
     */
    get image(): string | undefined {
        return this._image;
    }
}
