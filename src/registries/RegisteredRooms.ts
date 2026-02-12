import { CachedMap } from "@drincs/pixi-vn";
import type { RoomInterface } from "../interface";
import { logger } from "../utils/log-utility";
import RegisteredLocations from "./RegisteredLocations";
import RegisteredMaps from "./RegisteredMaps";

/**
 * A Map that contains all rooms registered and available to be used.
 * The key is the id of the room and the value is the room itself.
 */
const registeredRooms = new CachedMap<string, RoomInterface>({ cacheSize: 20 });

namespace RegisteredRooms {
    /**
     * Save a room in the registered rooms, and their location and map if they are not already registered.
     * If the room already exists, it will be overwritten.
     * @param room The room to save.
     * @returns
     */
    export function add(room: RoomInterface | RoomInterface[]) {
        if (Array.isArray(room)) {
            room.forEach((c) => add(c));
            return;
        }
        registeredRooms.set(room.id, room);
        let location = room.location;
        RegisteredLocations.add(location);
        let map = location?.map;
        if (map) {
            RegisteredMaps.add(map);
        }
    }

    /**
     * Get a room by its id.
     * @param id The id of the room.
     * @returns The room or undefined if not found.
     */
    export function get(id: string): RoomInterface | undefined {
        try {
            let room = registeredRooms.get(id);
            if (!room) {
                console.warn(`[NQTR] Room ${id} not found, you should register it first`);
                return;
            }
            return room;
        } catch (e) {
            logger.error(`Error while getting Room ${id}`, e);
            return;
        }
    }

    /**
     * Get a list of all rooms registered.
     * @returns An array of rooms.
     */
    export function values(): RoomInterface[] {
        return Array.from(registeredRooms.values());
    }

    /**
     * Check if a room is registered.
     * @param id The id of the room.
     * @returns True if the room is registered, false otherwise.
     */
    export function has(id: string): boolean {
        return registeredRooms.has(id);
    }
}
export default RegisteredRooms;
