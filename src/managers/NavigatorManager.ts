import { storage } from "@drincs/pixi-vn";
import { CURRENT_ROOM_MEMORY_KEY } from "../constants";
import { RegisteredRooms } from "../decorators";
import { registeredLocations, registeredMaps } from "../decorators/RegisteredRooms";
import { setLastEvent } from "../functions/tracking-changes";
import { LocationInterface, MapInterface, RoomInterface } from "../interface";
import { logger } from "../utils/log-utility";

export default class NavigatorManager {
    get rooms() {
        return RegisteredRooms.values();
    }
    get locations() {
        return Array.from(registeredLocations.values());
    }
    getLocationById(id: string): LocationInterface | undefined {
        return registeredLocations.get(id);
    }
    get maps() {
        return Array.from(registeredMaps.values());
    }
    getMapById(id: string): MapInterface | undefined {
        return registeredMaps.get(id);
    }
    get currentRoomId(): string | undefined {
        return storage.getVariable<string>(CURRENT_ROOM_MEMORY_KEY);
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
        let prevRoom = storage.getVariable<string>(CURRENT_ROOM_MEMORY_KEY);
        if (prevRoom === room) {
            return;
        }

        setLastEvent({
            type: "editroom",
            prev: prevRoom,
            value: room,
        });
        storage.setVariable(CURRENT_ROOM_MEMORY_KEY, room);
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
