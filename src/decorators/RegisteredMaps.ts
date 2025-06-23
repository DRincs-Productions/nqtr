import { CachedMap } from "@drincs/pixi-vn";
import { MapInterface } from "../interface";
import { logger } from "../utils/log-utility";

/**
 * A Map that contains all maps registered and available to be used.
 * The key is the id of the map and the value is the map itself.
 */
const registeredMaps = new CachedMap<string, MapInterface>({ cacheSize: 20 });

namespace RegisteredMaps {
    /**
     * Save a map in the registered maps. If the map already exists, it will be overwritten.
     * @param map The map to save.
     * @returns
     */
    export function add(map: MapInterface | MapInterface[]) {
        if (Array.isArray(map)) {
            map.forEach((c) => add(c));
            return;
        }
        if (registeredMaps.has(map.id)) {
            console.warn(`[NQTR] Map id ${map.id} already exists, it will be overwritten`);
        }
        registeredMaps.set(map.id, map);
    }

    /**
     * Get a map by its id.
     * @param id The id of the map.
     * @returns The map or undefined if not found.
     */
    export function get(id: string): MapInterface | undefined {
        try {
            let map = registeredMaps.get(id);
            if (!map) {
                console.warn(`[NQTR] Map ${id} not found, you should register it first`);
                return;
            }
            return map;
        } catch (e) {
            logger.error(`Error while getting Map ${id}`, e);
            return;
        }
    }

    /**
     * Get a list of all maps registered.
     * @returns An array of maps.
     */
    export function values(): MapInterface[] {
        return Array.from(registeredMaps.values());
    }

    /**
     * Check if a map is registered.
     * @param id The id of the map.
     * @returns True if the map is registered, false otherwise.
     */
    export function has(id: string): boolean {
        return registeredMaps.has(id);
    }
}
export default RegisteredMaps;
