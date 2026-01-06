import { storage } from "@drincs/pixi-vn";
import { LATEST_EVENT_MEMORY_KEY } from "../constants";
import LastEventType from "../types/LastEventType";

export function setLastEvent(event: LastEventType) {
    storage.set(LATEST_EVENT_MEMORY_KEY, event);
}
export function getLastEvent() {
    return storage.get<LastEventType>(LATEST_EVENT_MEMORY_KEY);
}
