---
name: nqtr
description: Index and entry point of the NQTR skill set — start here for any task on a project using @drincs/nqtr (Navigation Quest Time Routine), then follow the skill map to the right skill (navigation, time, activity, routine, quest, ink). Use when installing/configuring @drincs/nqtr, wiring vitePluginNqtr, overriding OnRunProps or the *Interface types in nqtr.d.ts, writing custom Room/Location/Map/Activity/Commitment/Quest classes, or deciding whether to write NQTR logic in ink or TypeScript.
---

# NQTR skill index and getting started

Official docs: [pixi-vn.com/nqtr](https://pixi-vn.com/nqtr). Machine-readable index of every Pixi'VN doc page: [pixi-vn.com/llms.txt](https://pixi-vn.com/llms.txt). Exact signatures and types: [jsdocs.pixi-vn.com/nqtr](https://jsdocs.pixi-vn.com/nqtr).

NQTR (Navigation Quest Time Routine) is an extension for `@drincs/pixi-vn` that adds navigation (rooms/locations/maps), a time system, activities, routines (character commitments) and quests.

## Rule: prefer ink when Pixi'VN is installed and configured

If the project depends on `@drincs/pixi-vn` **and** is configured for ink (`@drincs/pixi-vn-ink` installed, `.ink` files in use, or the template's *Ink + TypeScript* option), write every story-side interaction with NQTR **in ink** (hashtag commands and quest variables, see [nqtr-ink](../ink/SKILL.md)) instead of TypeScript labels. Typical examples: `# enter room`, `# set time`, `# wait`, `# add activity ... in ...`, `# add routine ... in ...`, `# start quest`, `# continue quest`, and `{questId_started}` conditions.

Use TypeScript only for what ink cannot express: defining/registering rooms, locations, maps, activities, commitments and quests, `timeTracker.initialize`, custom classes, `OnRunProps`. When the project has no ink setup, use the TypeScript API each skill documents. When unsure, check `package.json` and whether `createNqtrHandler`/`nqtrHandler` is already called.

## Skill map: which skill to load

| Task | Skill |
| --- | --- |
| Install/configure NQTR, Vite plugin, `OnRunProps`, `nqtr.d.ts`, custom classes overview | **nqtr** (this skill) |
| Any NQTR command or variable from `.ink` files | [nqtr-ink](../ink/SKILL.md) |
| Rooms, locations, maps, `navigator.currentRoom` | [nqtr-navigation](../navigation/SKILL.md) |
| Date/time, time slots, `wait`, weekends | [nqtr-time](../time/SKILL.md) |
| Player actions linked to rooms/locations/maps | [nqtr-activity](../activity/SKILL.md) |
| Characters' schedules (where an NPC is at a given time) | [nqtr-routine](../routine/SKILL.md) |
| Quests, stages, start/continue/fail, quest state queries | [nqtr-quest](../quest/SKILL.md) |

### Companion skill sets

- Core engine (`Game.init`, narration, canvas, characters, storage, saves, UI, ...): `npx skills@latest add DRincs-Productions/pixi-vn@latest --skill '*' -g -y` — entry point `pixi-vn`.
- Ink language and Pixi'VN hashtag commands (canvas, sound, input, ...): `npx skills@latest add DRincs-Productions/pixi-vn-ink@latest --skill '*' -g -y` — entry point `pixi-vn-ink`.

Install all of them together when working on an ink project.

## Installation

New project: use a template (`npm create pixi-vn@latest`); all templates already include NQTR. Existing project:

```bash
npm install @drincs/nqtr
```

Peer dependencies: `@drincs/pixi-vn`; optional `@drincs/pixi-vn-ink` (ink integration), `vite` (plugin), `zod`.

Package entry points: `@drincs/nqtr` (classes, registries, `navigator`, `timeTracker`, `routine`), `@drincs/nqtr/ink`, `@drincs/nqtr/vite`, plus `@drincs/nqtr/handlers` and `@drincs/nqtr/registries`.

## Registration is mandatory

Every entity must be added to its registry or it is not saved/found in the game:

| Entity | Class | Registry |
| --- | --- | --- |
| Room | `RoomBaseModel` | `RegisteredRooms.add(...)` |
| Location | `LocationBaseModel` | `RegisteredLocations.add(...)` |
| Map | `MapBaseModel` | `RegisteredMaps.add(...)` |
| Activity | `ActivityBaseModel` | `RegisteredActivities.add(...)` |
| Commitment | `CommitmentBaseModel` | `RegisteredCommitments.add(...)` |
| Quest | `QuestBaseModel` (+ `StageBaseModel`) | `RegisteredQuests.add(...)` |

Each registry also has `get(id)` and `values()`. Ids are plain strings; ink refers to entities by id, so keep ids stable and ink-friendly (`mc_room`, `aliceQuest`).

## Ink integration

Register the hashtag commands once at startup, together with the other ink setup:

```ts title="utils/ink-utility.ts"
import { createNqtrHandler } from "@drincs/nqtr/ink";

export function initializeInk() {
    createNqtrHandler(); // nqtrHandler() is the deprecated alias
    // ...
}
```

Options (`NqtrHandlerOptions`): `timeConverter`, `dateConverter`, `wait`, and the id lists `activityIds`, `commitmentIds`, `questIds`, `roomIds` (validate ids in hashtag commands at runtime). Full command list in [nqtr-ink](../ink/SKILL.md).

## Vite plugin: typed ids

`vitePluginNqtr` executes the content modules and writes a file with `as const` id arrays and `declare module "@drincs/nqtr/registries"` augmentations, so `RoomIdType`, `ActivityIdType`, ... become unions of the real ids.

```ts title="vite.config.ts"
import { vitePluginNqtr } from "@drincs/nqtr/vite";
import { vitePluginPixivn } from "@drincs/pixi-vn/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [
        vitePluginPixivn({ content: "./src/content/index.ts" }),
        vitePluginNqtr({ typeFilePath: "./src/nqtr.keys.gen.ts" }),
    ],
});
```

With `vitePluginPixivn` in the same config, NQTR piggy-backs on its content loading. Standalone, pass globs: `activities`, `commitments`, `locations`, `maps`, `quests`, `rooms`. Include the generated file in the TS compilation and pass its arrays to `createNqtrHandler({ roomIds: nqtrRoomIds, ... })` for validated ink commands. The generated file is excluded from HMR; do not edit it by hand.

## `OnRunProps` and `nqtr.d.ts`

Callbacks (`onRun`, `onStart`, `onContinue`, ...) receive an `OnRunProps` object. Override the interface in a `.d.ts` to expose your own helpers (all templates already do):

```ts title="nqtr.d.ts"
import type { StepLabelProps } from "@drincs/pixi-vn";

declare module "@drincs/nqtr" {
    interface OnRunProps extends StepLabelProps {
        navigate: (opts: { to: string }) => Promise<void>;
    }
}
```

Pass the received `props` on to `narration.jump(label, props)` / `quest.start(props)`.

## Custom classes

Templates define `Room`, `Location`, `Map`, `Activity`, `Commitment`, `Quest` in `models/`. The pattern, used by every entity:

1. Extend the `*StoredClass` (`RoomStoredClass`, `LocationStoredClass`, `MapStoredClass`, `ActivityStoredClass`, `CommitmentStoredClass`, `QuestStoredClass`) and implement the matching `*Interface`.
2. Augment the interface in `nqtr.d.ts` (`declare module "@drincs/nqtr" { interface RoomInterface { ... } }`) with the extra properties (`name`, `sprite`, `icon`, `disabled`, `hidden`, ...).
3. Persist mutable properties with `this.getStorageProperty<T>(key)` / `this.setStorageProperty(key, value)` in getters/setters, so they survive save/load.

Use the `*BaseModel` classes directly only for quick prototypes. Per-entity examples are in the matching skill.

## Common pitfalls

- Forgetting `Registered*.add(...)`: the entity is neither saved nor reachable from ink.
- Referencing an id in ink that is not registered: the handler logs a warning (`Room x not found`) and does nothing; with the id lists/Vite plugin it fails validation instead.
- Initialization-time links (`activities: [...]`, `routine: [...]` in the constructor) are not saved, runtime links (`addActivity`/`addCommitment`) are. See [nqtr-activity](../activity/SKILL.md) and [nqtr-routine](../routine/SKILL.md).
