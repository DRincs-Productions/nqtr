import { navigator, timeTracker } from "@drincs/nqtr/handlers";
import { RegisteredRooms } from "@drincs/nqtr/registries";
import { HashtagHandler } from "@drincs/pixi-vn-ink";
import { logger } from "../utils/log-utility";

export const nqtrHandler: () => HashtagHandler =
    ({
        timeConverter = (time: string) => Number(time.replace(":", ".")),
        dateConverter = (date: string) => Number(date),
    }: {
        /**
         * Custom time converter function to convert time strings to numbers. The default implementation converts "HH:MM" format to hours as a number (e.g. "01:30" => 1.5).
         * @default (time: string) => Number(time.replace(":", "."))
         * @param time Time string in the format "HH:MM"
         * @returns Time in hours as a number (e.g. "01:30" => 1.5)
         */
        timeConverter?: (time: string) => number;
        /**
         * Custom date converter function to convert date strings to numbers. The default implementation converts a string to a number using `Number()`.
         * @default (date: string) => Number(date)
         * @param date Date string
         * @returns Date as a number
         */
        dateConverter?: (date: string) => number;
    } = {}) =>
    (script, props, convertListStringToObj) => {
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
                            const time = timeConverter("01:00".replace(":", "."));
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
                            const date = dateConverter(script[2]);
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
