---
name: nqtr-activity
description: Use when creating NQTR activities (actions the player can take, linked to rooms/locations/maps) — ActivityBaseModel, RegisteredActivities, linking at init (activities in the room constructor) vs at runtime (room.addActivity / "# add activity X in room"), unlinking, timeSlot/dateScheduling, disabled/hidden, and custom Activity classes.
---

# NQTR activities

Official docs: [pixi-vn.com/nqtr/activity](https://pixi-vn.com/nqtr/activity). Index: [nqtr](../getting-started/SKILL.md). Ink commands: [nqtr-ink](../ink/SKILL.md).

An activity is an action the player can take (sleep in the bed, order a product, ...) linked to a navigation element ([rooms/locations/maps](../navigation/SKILL.md)). How it is shown and triggered (button, icon, sprite) is up to your UI.

## Initialize

`new ActivityBaseModel(id, onRun, props)`; register with `RegisteredActivities.add(...)` (**required**). `onRun(activity, props)` receives the `OnRunProps`; typically navigate to the narration screen, then jump to the story label/knot. When the story is written in ink, jump to the ink knot with the same name.

```ts title="content/activities.ts"
import { ActivityBaseModel, RegisteredActivities, timeTracker } from "@drincs/nqtr";
import { narration } from "@drincs/pixi-vn";

export const bed = new ActivityBaseModel(
    "bed",
    async (_, props) => {
        await props.navigate({ to: "/game/narration" });
        await narration.jump(timeTracker.nowIsBetween(5, 22) ? "nap" : "sleep", props);
    },
    { name: "bed" },
);

RegisteredActivities.add(bed);
```

```ink
=== nap ===
mc: A short nap.
# wait 2
-> DONE
```

`ActivityProps`: `name`, `timeSlot` (`{ from, to? }`, active only in that time range), `dateScheduling` (`{ from, to? }`, active only in that date range), `disabled` / `hidden` (boolean or a Pixi'VN flag name), `renderIcon`.

## Link (many-to-many)

An activity is only available when linked to a navigation element.

1. **At initialization** — `activities: ["bed"]` in the room/location/map constructor. Not saved with the game, so you can change it between versions without migrations.
2. **During the game** — saved with the game; for temporary activities.

```ink
# add activity order_product in mc_room
```

```ts
mcRoom.addActivity("order_product"); // or the activity instance
```

## Unlink

Only activities linked at runtime can be removed:

```ink
# remove activity order_product from mc_room
```

```ts
mcRoom.removeActivity("order_product");
```

Init-time links cannot be removed; use `disabled`/`hidden` or `timeSlot`/`dateScheduling` to control them.

## Get

`RegisteredActivities.get(id)` and `RegisteredActivities.values()`. `activity.isActive(options?)` tells whether it is available for the current time/date; `activity.expired` whether its date range has passed.

## Custom class

Extend `ActivityStoredClass` and implement `ActivityInterface`; augment the interface in `nqtr.d.ts` with `name`, `disabled`, `hidden`, `sprite?`, `icon?`. Constructor: `super(id, onRun, props)` with `ActivityStoredClassProps` (`timeSlot`, `dateScheduling`). Persist `disabled`/`hidden` via `getStorageProperty`/`setStorageProperty`. Override `isActive` to return `false` when `hidden`, and `run` to refresh the UI after running (`await runProps.invalidateInterfaceData()`), as the templates do.

## Pitfalls

- Forgetting `RegisteredActivities.add`.
- Linking by id before the activity is registered: register activities before use, or rely on the id lists/Vite plugin for validation.
- Prefer a stable id: ink commands use it.
