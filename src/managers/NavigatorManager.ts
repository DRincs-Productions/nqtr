import { storage } from "@drincs/pixi-vn";
import { getRoomById, registeredRooms } from "../decorators/RoomDecorator";
import { LocationInterface, MapInterface, RoomInterface } from "../interface";

const CURRENT_ROOM_MEMORY_KEY = "___nqtr-current_room_memory___";
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
	set currentRoom(room: RoomInterface) {
		let roomRegistrated = getRoomById(room.id);
		if (!roomRegistrated) {
			console.error(`[NQTR] The room ${room.id} is not registered, so it can't be set as current room`);
			return;
		}
		storage.setVariable(CURRENT_ROOM_MEMORY_KEY, room.id);
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
