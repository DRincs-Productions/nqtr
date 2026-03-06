import { CharacterBaseModel, Game, RegisteredCharacters } from "@drincs/pixi-vn";
import {
    ActivityBaseModel,
    CommitmentBaseModel,
    LocationBaseModel,
    MapBaseModel,
    RegisteredActivities,
    RegisteredCommitments,
    RegisteredLocations,
    RegisteredMaps,
    RegisteredRooms,
    RoomBaseModel,
} from "../src";

export const mc = new CharacterBaseModel("mc", {
    name: "Liam",
});

export const alice = new CharacterBaseModel("alice", {
    name: "Alice",
});

RegisteredCharacters.add([mc, alice]);

export const bed = new ActivityBaseModel("bed", async (_, event) => {}, {
    name: "bed",
});
export const orderProduct = new ActivityBaseModel("order_product", async (_, event) => {}, {
    name: "order_product",
});
export const takeProduct = new ActivityBaseModel("take_product", async (_, event) => {}, {
    name: "take_product",
});
RegisteredActivities.add([bed, orderProduct, takeProduct]);

export const mainMap = new MapBaseModel("main_map", {
    name: "Main Map",
});
RegisteredMaps.add([mainMap]);

export const mcHome = new LocationBaseModel("mc_home", mainMap, {
    name: "MC Home",
});
export const gym = new LocationBaseModel("gym", mainMap, {
    name: "Gym",
});
export const school = new LocationBaseModel("school", mainMap, {
    name: "School",
});
RegisteredLocations.add([mcHome, gym, school]);

const aliceSleep = new CommitmentBaseModel("alice_sleep", alice, {
    priority: 1,
    timeSlot: {
        from: 20,
        to: 10,
    },
    onRun: (_, event) => {},
});
const aliceGoSchool = new CommitmentBaseModel("alice_go_school", alice, {
    timeSlot: {
        from: 8,
        to: 14,
    },
    priority: 2,
});
const aliceSmokes = new CommitmentBaseModel("alice_smokes", alice, {
    timeSlot: {
        from: 10,
        to: 20,
    },
    onRun: (_, event) => {},
});
export const fixedRoutine = [aliceSleep, aliceGoSchool, aliceSmokes];
RegisteredCommitments.add(fixedRoutine);

export const mcRoom = new RoomBaseModel("mc_room", mcHome, {
    name: "MC room",
    activities: [bed],
});
export const aliceRoom = new RoomBaseModel("alice_room", mcHome, {
    name: "Alice room",
    routine: [aliceSleep],
});
export const annRoom = new RoomBaseModel("ann_room", mcHome, {
    name: "Ann room",
});
export const bathroom = new RoomBaseModel("bathroom", mcHome, {
    name: "Bathroom",
});
export const lounge = new RoomBaseModel("lounge", mcHome, {
    name: "Lounge",
});
export const terrace = new RoomBaseModel("terrace", mcHome, {
    name: "Terrace",
    routine: [aliceSmokes],
});
export const gymRoom = new RoomBaseModel("gym_room", gym, {
    name: "Gym",
});
export const classRoom = new RoomBaseModel("class_room", school, {
    name: "School",
    routine: [aliceGoSchool],
});
RegisteredRooms.add([mcRoom, aliceRoom, annRoom, bathroom, lounge, terrace, gymRoom, classRoom]);

Game.init();
