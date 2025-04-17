import { narration, storage } from "@drincs/pixi-vn";
import { CURRENT_ROOM_MEMORY_KEY, LATEST_EVENT_MEMORY_KEY, TIME_DATA_KEY } from "../constants";
import { navigator } from "../managers";
import LastEventType from "../types/LastEventType";
import TimeDataType from "../types/TimeDataType";

export function setLastEvent(event: LastEventType) {
    storage.setVariable(LATEST_EVENT_MEMORY_KEY, event);
}
export function getLastEvent() {
    return storage.getVariable<LastEventType>(LATEST_EVENT_MEMORY_KEY);
}
export function addTempHistoryItem() {
    let lastEvent = getLastEvent();
    let currentRoom = navigator.currentRoom;
    if (!currentRoom || !currentRoom.automaticFunction) {
        narration.addCurrentStepToHistory();
        return;
    }
    switch (lastEvent?.type) {
        case "editroom":
            storage.setVariable(CURRENT_ROOM_MEMORY_KEY, lastEvent.prev);
            narration.addCurrentStepToHistory();
            storage.setVariable(CURRENT_ROOM_MEMORY_KEY, currentRoom.id);
            break;
        case "edittime":
            let currentTime = storage.getVariable<TimeDataType>(TIME_DATA_KEY) || {};
            storage.setVariable(TIME_DATA_KEY, lastEvent.prev);
            narration.addCurrentStepToHistory();
            storage.setVariable(TIME_DATA_KEY, currentTime);
            break;
    }
}
