---
name: nqtr-routine
description: Use when scheduling NQTR character routines — CommitmentBaseModel (where a character is at a given time), RegisteredCommitments, timeSlot/dateScheduling/priority/executionType, linking at init (routine in the room constructor) vs runtime (room.addCommitment / "# add routine X in room"), removing with routine.remove / "# remove routine X", and custom Commitment classes.
---

# NQTR routine (commitments)

Official docs: [pixi-vn.com/nqtr/routine](https://pixi-vn.com/nqtr/routine). Index: [nqtr](../getting-started/SKILL.md). Ink commands: [nqtr-ink](../ink/SKILL.md).

A **commitment** says that a character is busy in a room during a time slot. The routine is the set of commitments active now; it decides which characters are in the current room and what happens when the player interacts with them.

## Initialize

`new CommitmentBaseModel(id, character | characters | undefined, props)`, then `RegisteredCommitments.add(...)` (**required**). `character` is a character id/instance, or an array.

```ts title="content/routine.ts"
import { CommitmentBaseModel, RegisteredCommitments } from "@drincs/nqtr";
import { narration } from "@drincs/pixi-vn";

export const aliceSleep = new CommitmentBaseModel("alice_sleep", "alice", {
    priority: 1,
    timeSlot: { from: 20, to: 10 }, // wraps over midnight
    onRun: async (_, props) => {
        await props.navigate({ to: "/game/narration" });
        await narration.jump("talk_alice_sleep", props);
    },
});

RegisteredCommitments.add(aliceSleep);
```

`CommitmentProps`: `name`, `timeSlot`, `dateScheduling`, `image`, `icon`, `onRun`, `disabled`/`hidden` (boolean or flag name), `priority` (default 0), `executionType`.

- `executionType: "interaction"` (default): `onRun` runs when the player interacts with the character. `"automatic"`: `onRun` runs automatically when the player enters the room — remove the commitment when no longer needed or it repeats every time.
- A disabled commitment is ignored, so the character is not in the room but free for other commitments.
- A character cannot be in two places: among valid simultaneous commitments of the same character the highest `priority` wins; by default runtime-added commitments beat init-time ones.

## Link (one commitment → one room)

1. **At initialization** — `routine: ["alice_sleep"]` in the `RoomBaseModel` constructor. Not saved.
2. **During the game** — saved with the game.

```ink
# add routine alice_smokes in terrace
```

```ts
terrace.addCommitment("alice_smokes");
```

## Unlink

Init-time links cannot be removed: add a higher-priority commitment for the same character and time slot instead. Runtime links:

```ink
# remove routine alice_smokes
```

```ts
import { routine } from "@drincs/nqtr";
routine.remove("alice_smokes");       // optional second argument: roomId
```

## Query

`RegisteredCommitments.get(id)` / `.values()`. `routine.currentRoutine` (active commitments), `routine.roomCommitments[roomId]`, `routine.characterCommitments[characterId]`, `routine.getCommitmentByCharacter(...)`, `routine.clearExpiredRoutine()`.

## Custom class

Extend `CommitmentStoredClass` (`super(id, characters, props.onRun, props)`), implement `CommitmentInterface`, augment it in `nqtr.d.ts` (`name`, `sprite?`, `background?`, `icon?`, `disabled`, `hidden`). Persist `disabled`/`hidden` with `getStorageProperty`/`setStorageProperty`, override `isActive` (false when hidden) and `run` (invalidate UI afterwards), like the templates.

## Pitfalls

- Commitments depend on [time](../time/SKILL.md): nothing changes until time advances (`# wait`).
- Forgetting `RegisteredCommitments.add` or the character not being registered.
