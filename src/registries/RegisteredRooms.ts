import type { RoomInterface } from "@/interface";
import RegisteredLocations from "@/registries/RegisteredLocations";
import RegisteredMaps from "@/registries/RegisteredMaps";
import { logger } from "@/utils/log-utility";
import { CachedMap } from "@drincs/pixi-vn";

/**
 * A Map that contains all rooms registered and available to be used.
 * The key is the id of the room and the value is the room itself.
 */
export const registeredRooms = new CachedMap<string, RoomInterface>({ cacheSize: 20 });

namespace RegisteredRooms {
    /**
     * Save a room in the registered rooms, and their location and map if they are not already registered.
     * If the room already exists, it will be overwritten.
     * @param room The room to save.
     * @returns
     */
    export function add(room: RoomInterface | RoomInterface[]) {
        if (Array.isArray(room)) {
            room.forEach((c) => {
                add(c);
            });
            return;
        }
        registeredRooms.set(room.id, room);
        const location = room.location;
        RegisteredLocations.add(location);
        const map = location?.map;
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
            const room = registeredRooms.get(id);
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

    /**
     * Remove all registered rooms.
     * Primarily used by the Vite plugin to reset state between hot-module reloads.
     */
    export function clear(): void {
        registeredRooms.clear();
    }
}
export default RegisteredRooms;
