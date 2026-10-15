import type { LocationInterface, MapInterface, RoomIdType, RoomInterface } from "@/interface";

/**
 * Handler that manages the navigation system: it gives access to all the registered
 * rooms, locations and maps, and keeps track of the room where the player currently is.
 */
export default interface NavigatorHandlerInterface {
    /**
     * All the registered rooms.
     */
    readonly rooms: RoomInterface[];
    /**
     * All the registered locations.
     */
    readonly locations: LocationInterface[];
    /**
     * All the registered maps.
     */
    readonly maps: MapInterface[];
    /**
     * The id of the room where the player currently is, read from the game storage.
     * It is `undefined` if the current room has not been set yet.
     */
    readonly currentRoomId: string | undefined;
    /**
     * The room where the player currently is.
     * Getting it returns `undefined` (and logs an error) if the current room has not been set
     * or if it is not registered.
     *
     * Setting it accepts a room or a room id. If the room is not registered, an error is logged
     * and nothing changes. If it is already the current room, nothing happens; otherwise
     * the change is stored and tracked as the last event.
     */
    get currentRoom(): RoomInterface | undefined;
    set currentRoom(room: RoomInterface | RoomIdType);
    /**
     * The location that contains the current room, or `undefined` if there is no current room.
     */
    readonly currentLocation: LocationInterface | undefined;
    /**
     * The map that contains the current location, or `undefined` if there is no current room.
     */
    readonly currentMap: MapInterface | undefined;
    /**
     * Clear all the expired activities from every registered room.
     */
    clearExpiredActivities(): void;
}
