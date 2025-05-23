import { storage } from "@drincs/pixi-vn";
import { CURRENT_ROOM_MEMORY_KEY } from "../constants";
import { RegisteredRooms } from "../decorators";
import { setLastEvent } from "../functions/tracking-changes";
import { LocationInterface, MapInterface, RoomInterface } from "../interface";

export default class NavigatorManager {
    get rooms() {
        return RegisteredRooms.values();
    }
    get locations() {
        let result: { [id: string]: LocationInterface } = {};
        RegisteredRooms.values().forEach((room) => {
            result[room.location.id] = room.location;
        });
        return Object.values(result);
    }
    get maps() {
        let result: { [id: string]: MapInterface } = {};
        RegisteredRooms.values().forEach((room) => {
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
        let room = RegisteredRooms.get(roomId);
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
        let roomRegistrated = RegisteredRooms.get(room);
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
        RegisteredRooms.values().forEach((room) => {
            room.clearExpiredActivities();
        });
    }
}
