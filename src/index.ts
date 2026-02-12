export * from "@drincs/nqtr/handlers";
export {
    RegisteredActivities,
    RegisteredCommitments,
    RegisteredLocations,
    RegisteredMaps,
    RegisteredQuests,
    RegisteredRooms,
} from "@drincs/nqtr/registries";
export * from "./classes";
export * from "./interface";
export * from "./types";

import * as registries from "@drincs/nqtr/registries";
import * as classes from "./classes";
import * as handlers from "./handlers";
import * as interfaceNqtr from "./interface";
import * as types from "./types";

const nqtr = {
    ...classes,
    ...interfaceNqtr,
    ...types,
    handlers,
    registries,
};
export default nqtr;
