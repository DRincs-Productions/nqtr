import { storage } from "@drincs/pixi-vn";
import { CURRENT_ROOM_MEMORY_KEY } from "../constants";
import { getRoomById, registeredRooms } from "../decorators/RoomDecorator";
import { setLastEvent } from "../functions/tracking-changes";
import { LocationInterface, MapInterface, RoomInterface } from "../interface";

export default class NavigatorManager {
    get rooms() {
        return Object.values(registeredRooms);
    }
    get locations() {
        let result: { [id: string]: LocationInterface } = {};
        Object.values(registeredRooms).forEach((room) => {
            result[room.location.id] = room.location;
        });
        return Object.values(result);
    }
    get maps() {
        let result: { [id: string]: MapInterface } = {};
        Object.values(registeredRooms).forEach((room) => {
            result[room.location.map.id] = room.location.map;
        });
        return Object.values(result);
    }
    get currentRoom(): RoomInterface | undefined {
        let roomId = storage.getVariable<string>(CURRENT_ROOM_MEMORY_KEY);
        if (!roomId) {
            console.error(`[NQTR] The current room has not yet been set`);
            return;
        }
        let room = getRoomById(roomId);
        if (!room) {
            console.error(`[NQTR] Current room ${roomId} not found`);
            return;
        }
        return room;
    }
    set currentRoom(room: RoomInterface | string) {
        if (typeof room !== "string") {
            room = room.id;
        }
        let roomRegistrated = getRoomById(room);
        if (!roomRegistrated) {
            console.error(`[NQTR] The room ${room} is not registered, so it can't be set as current room`);
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
        Object.entries(registeredRooms).forEach(([_, room]) => {
            room.clearExpiredActivities();
        });
    }
}
