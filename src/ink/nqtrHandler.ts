import { navigator, timeTracker } from "@drincs/nqtr/handlers";
import { RegisteredRooms } from "@drincs/nqtr/registries";
import { HashtagHandler } from "@drincs/pixi-vn-ink";
import { logger } from "../utils/log-utility";

export const nqtrHandler: HashtagHandler = (script, props, convertListStringToObj) => {
    switch (script[1]) {
        case "room":
            switch (script[0]) {
                case "enter":
                    if (script.length > 2) {
                        const room = RegisteredRooms.get(script[2]);
                        if (!room) {
                            logger.warn(`Room ${script[2]} not found`);
                        } else {
                            navigator.currentRoom = room;
                        }
                        return true;
                    }
                    break;
            }
            break;
        case "time":
            switch (script[0]) {
                case "set":
                    if (script.length > 2) {
                        const time = parseInt(script[2].replace(":", ""));
                        if (isNaN(time)) {
                            logger.warn(`Invalid time format: ${script[2]}`);
                        } else {
                            timeTracker.currentTime = time;
                        }
                        return true;
                    }
                    break;
            }
            break;
        case "date":
            switch (script[0]) {
                case "set":
                    if (script.length > 2) {
                        const date = parseInt(script[2]);
                        if (isNaN(date)) {
                            logger.warn(`Invalid date format: ${script[2]}`);
                        } else {
                            timeTracker.currentDate = date;
                        }
                        return true;
                    }
                    break;
            }
            break;
    }
    return false;
};
