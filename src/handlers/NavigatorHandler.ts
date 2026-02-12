import { RegisteredLocations, RegisteredMaps, RegisteredRooms } from "@drincs/nqtr/registries";
import { storage } from "@drincs/pixi-vn/storage";
import { CURRENT_ROOM_MEMORY_KEY } from "../constants";
import { setLastEvent } from "../functions/tracking-changes";
import type { LocationInterface, MapInterface, RoomInterface } from "../interface";
import { logger } from "../utils/log-utility";

export default class NavigatorHandler {
    get rooms() {
        return RegisteredRooms.values();
    }
    get locations() {
        return RegisteredLocations.values();
    }
    get maps() {
        return RegisteredMaps.values();
    }
    get currentRoomId(): string | undefined {
        return storage.get<string>(CURRENT_ROOM_MEMORY_KEY);
    }
    get currentRoom(): RoomInterface | undefined {
        let roomId = this.currentRoomId;
        if (!roomId) {
            logger.error(`The current room has not yet been set`);
            return;
        }
        let room = RegisteredRooms.get(roomId);
        if (!room) {
            logger.error(`Current room ${roomId} not found`);
            return;
        }
        return room;
    }
    set currentRoom(room: RoomInterface | string) {
        if (typeof room !== "string") {
            room = room.id;
        }
        let roomRegistrated = RegisteredRooms.get(room);
        if (!roomRegistrated) {
            logger.error(`The room ${room} is not registered, so it can't be set as current room`);
            return;
        }
        let prevRoom = storage.get<string>(CURRENT_ROOM_MEMORY_KEY);
        if (prevRoom === room) {
            return;
        }

        setLastEvent({
            type: "editroom",
            prev: prevRoom,
            value: room,
        });
        storage.set(CURRENT_ROOM_MEMORY_KEY, room);
    }
    get currentLocation(): LocationInterface | undefined {
        return this.currentRoom?.location;
    }
    get currentMap(): MapInterface | undefined {
        return this.currentRoom?.location.map;
    }
    /**
     * Clear all the expired activities.
     */
    clearExpiredActivities() {
        RegisteredRooms.values().forEach((room) => {
            room.clearExpiredActivities();
        });
    }
}
