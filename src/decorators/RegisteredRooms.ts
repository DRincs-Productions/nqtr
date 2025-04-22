import { RoomInterface } from "../interface";

/**
 * A Map that contains all rooms registered and available to be used.
 * The key is the id of the room and the value is the room itself.
 */
export const registeredRooms = new Map<string, RoomInterface>();

namespace RegisteredRooms {
    /**
     * Save a room in the registered rooms. If the room already exists, it will be overwritten.
     * @param room The room to save.
     * @returns
     * @example
     * ```ts
     * saveRoom([mcRoom, aliceRoom, annRoom, bathroom, lounge, terrace, gymRoom]);
     * ```
     */
    export function add(room: RoomInterface | RoomInterface[]) {
        if (Array.isArray(room)) {
            room.forEach((c) => add(c));
            return;
        }
        if (registeredRooms.has(room.id)) {
            console.warn(`[NQTR] Room id ${room.id} already exists, it will be overwritten`);
        }
        registeredRooms.set(room.id, room);
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
                console.error(`[NQTR] Room ${id} not found`);
                return;
            }
            return room;
        } catch (e) {
            console.error(`[NQTR] Error while getting Room ${id}`, e);
            return;
        }
    }
}
export default RegisteredRooms;
