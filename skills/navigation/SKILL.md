---
name: nqtr-navigation
description: Use when defining or navigating NQTR rooms, locations and maps — RoomBaseModel/LocationBaseModel/MapBaseModel, RegisteredRooms/RegisteredLocations/RegisteredMaps, navigator.currentRoom, "# enter room" in ink, entrance rooms, and custom Room/Location/Map classes. Navigation is the base of NQTR; activities and routines attach to it.
---

# NQTR navigation and map

Official docs: [pixi-vn.com/nqtr/navigation](https://pixi-vn.com/nqtr/navigation). Index: [nqtr](../getting-started/SKILL.md). Prefer ink for story-side navigation when the project uses ink: [nqtr-ink](../ink/SKILL.md).

## Concepts

| Element | Role |
| --- | --- |
| `room` | The core element; the position of the MC and NPCs is deduced from it |
| `location` | Container of rooms |
| `map` | Container of locations |

The player moves between rooms; the current location and map are derived from the current room. The terms are conventional (in a space game: planets/solar systems/galaxy).

## Initialize

Create map → location → room (each needs its parent) and register them. `Registered*.add` is **required**.

```ts title="content/maps.ts"
import { MapBaseModel, RegisteredMaps } from "@drincs/nqtr";

export const mainMap = new MapBaseModel("main_map", { name: "Main Map", image: "map" });
RegisteredMaps.add(mainMap);
```

```ts title="content/locations.ts"
import { LocationBaseModel, RegisteredLocations } from "@drincs/nqtr";
import { mainMap } from "@/content/maps";

export const mcHome = new LocationBaseModel("mc_home", mainMap, { name: "MC Home" });
RegisteredLocations.add(mcHome);
```

```ts title="content/rooms.ts"
import { RegisteredRooms, RoomBaseModel } from "@drincs/nqtr";
import { mcHome } from "@/content/locations";

export const mcRoom = new RoomBaseModel("mc_room", mcHome, {
    name: "MC room",
    image: "location_myroom",
    activities: ["bed"],          // see nqtr-activity
});
export const aliceRoom = new RoomBaseModel("alice_room", mcHome, {
    name: "Alice room",
    image: "location_aliceroom",
    routine: ["alice_sleep"],     // see nqtr-routine
});
RegisteredRooms.add(mcRoom, aliceRoom);
```

Import order: content files that reference each other must not form cycles; the parent (map, then location) is imported by the child.

## Get / get all

`RegisteredRooms.get(id)`, `RegisteredLocations.get(id)`, `RegisteredMaps.get(id)`; `.values()` returns all. `navigator.rooms/locations/maps` list the registered entities.

## Navigate

Set the current room; location and map update automatically. Do it at game start too.

```ink
=== start ===
# enter room mc_room
-> DONE
```

```ts
import { navigator } from "@drincs/nqtr";
navigator.currentRoom = mcRoom;            // accepts a room or its id
navigator.currentRoomId; navigator.currentLocation; navigator.currentMap;
```

`navigator.clearExpiredActivities()` drops activities whose schedule ended.

## Custom classes

Extend `RoomStoredClass` / `LocationStoredClass` / `MapStoredClass`, implement the matching interface, and augment it in `nqtr.d.ts` (`name`, `sprite`/`background`, `disabled`, `hidden`, `entrance`, ...). Constructor shapes: `Room(id, location, { activities?, routine? })`, `Location(id, map, activities?)`, `Map(id, activities?)`. Store mutable flags with `getStorageProperty`/`setStorageProperty`:

```ts title="models/Room.ts"
export default class Room extends RoomStoredClass implements RoomInterface {
    constructor(id: string, location: LocationInterface, props: { name: string; activities?: (ActivityInterface | ActivityIdType)[]; routine?: (CommitmentInterface | CommitmentIdType)[]; isEntrance?: boolean }) {
        super(id, location, { activities: props.activities || [], routine: props.routine || [] });
        this.name = props.name;
        this.isEntrance = props.isEntrance || false;
    }
    readonly name: string;
    readonly isEntrance: boolean;
    get hidden(): boolean { return this.getStorageProperty<boolean>("hidden") || false; }
    set hidden(value: boolean) { this.setStorageProperty("hidden", value); }
}
```

### Graphical elements (`background`, `sprite`, `icon`)

- `background` accepts a string (the **alias of a linked asset**) or a `TimeSlotsImage` (see [time](../time/SKILL.md)) to change the image by time of day.
- `sprite` accepts either a **string** (the alias of a linked asset) or a function returning a PixiJS element (e.g. a `Sprite` with `eventMode: "static"` and a `pointerdown` handler) when you need full control.
- `icon` is a function returning a UI element (e.g. a React button).

### Default ("entrance") room of a location

Add `isEntrance` to `Room` (and `RoomInterface`), and in `Location` expose `get entrance()` returning `super.rooms.find((r) => r.isEntrance) || super.rooms[0]` (or `undefined` if empty). A map UI then does `navigator.currentRoom = location.entrance` when the location icon is clicked.

## Pitfalls

- Forgetting `Registered*.add`: the room cannot be saved or entered from ink.
- Overriding `rooms`/`locations` getters to filter `hidden` is common; remember hidden rooms are then absent from `location.rooms`.
