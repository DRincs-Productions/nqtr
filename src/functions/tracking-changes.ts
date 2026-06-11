import { LATEST_EVENT_MEMORY_KEY } from "@/constants";
import type LastEventType from "@/types/LastEventType";
import { storage } from "@drincs/pixi-vn/storage";

export function setLastEvent(event: LastEventType) {
    storage.set(LATEST_EVENT_MEMORY_KEY, event);
}
export function getLastEvent() {
    return storage.get<LastEventType>(LATEST_EVENT_MEMORY_KEY);
}
