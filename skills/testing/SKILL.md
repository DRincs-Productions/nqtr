---
name: nqtr-testing
description: Drive and inspect NQTR games from browser automation through the opt-in testing bridge, and connect application actions with awaited UI query refresh.
---

# NQTR testing bridge

Enable the bridge only in development:

```ts
import { testing } from "@drincs/nqtr";
if (import.meta.env.DEV) testing.enable(); // window.nqtr
```

Use `testing.setProps(props)` to supply current `OnRunProps`, and
`testing.setActions(actions)` to register application actions that await UI refresh.
Unspecified actions use NQTR directly. `enable({ windowKey })` replaces the previous
session; `disable()` removes its global property and `isEnabled()` reports its state.
Props and action registrations survive disable/enable. Unknown IDs reject with an error.

## Read content without React hooks

`getCurrentRoom()` returns the current registered room or undefined.
`getRooms()`, `getActivities()`, `getCommitments()`, and `getQuests()` return all
registered domain objects, including inactive content. `getRoutine()` returns the
unique commitments in the current active routine. Read fields explicitly when returning
browser evaluation results; domain objects can contain functions or cyclic references.

## Drive actions

```js
const api = window.nqtr;
api.getRooms().map(room => room.id);
await api.goToRoom("mc_room");
await api.increaseTime(2);
await api.increaseDate(1, 8);
await api.addActivity("mc_room", "order_product");
await api.removeActivity("mc_room", "order_product");
await api.addCommitment("terrace", "alice_quest_talk");
await api.removeRoutine("alice_smokes");
await api.runActivity("order_product");
await api.runCommitment("alice_quest_talk");
await api.startQuest("aliceQuest");
await api.continueQuest("aliceQuest");
```

These examples are independent operations; the game must make an item available before
it can be run through the template. `removeRoutine` follows `routine.remove`: it removes
a temporary commitment, not a fixed registration. Time actions are direct engine
operations; they do not apply the template's sleep/wait rules or automatic cleanup.

## React template integration

Register `useNqtrFunctions()` results from the template's development-only
`useTestingBridge()`. This shared hook can also run in normal React components.
It resolves IDs, applies UI availability checks for room/activity/commitment execution,
manages loading, and awaits query invalidation. Activity and commitment model `run`
methods already await their own refresh, so do not invalidate twice in the wrapper.
Quest actions supply current game props automatically. The library itself does not
depend on React Query. Do not call React hooks inside narrative labels.

Changing rooms mounts the navigation screen and refreshes its queries. Automatic
room events run through the existing screen effect and may outlive the action:
inspect narration and loading state before issuing the next action.

`wait` and `sleep` are intentionally not testing actions.
