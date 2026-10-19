---
name: nqtr-quest
description: Use when creating or driving NQTR quests — QuestBaseModel with StageBaseModel stages (onStart, deltaDateRequired, flags, questsRequired), RegisteredQuests, start/continue/advanceIfCompleted, failing a quest, state queries (started, completed, failed, currentStageIndex) and the ink commands "# start quest", "# continue quest" with the questId_started / _currentStageIndex variables.
---

# NQTR quests

Official docs: [pixi-vn.com/nqtr/quest](https://pixi-vn.com/nqtr/quest). Index: [nqtr](../getting-started/SKILL.md). Ink commands and variables: [nqtr-ink](../ink/SKILL.md).

A quest is an ordered list of stages. Starting it enters stage 0; continuing moves to the next stage; after the last stage the quest is completed.

## Initialize

`new QuestBaseModel(id, stages, props)`; `new StageBaseModel(id, props)`. Register with `RegisteredQuests.add(...)` (**required**). Stage `onStart` is the place to link activities/commitments that make the stage playable.

```ts title="content/quests/alice.quest.ts"
import { QuestBaseModel, RegisteredQuests, StageBaseModel } from "@drincs/nqtr";
import { mcRoom, terrace } from "@/content/rooms";

export const aliceQuest = new QuestBaseModel(
    "aliceQuest",
    [
        new StageBaseModel("talk_alice1", {
            name: "Talk to Alice",
            description: "Talk to Alice on the terrace",
            onStart: () => terrace.addCommitment("alice_quest_talk"),
        }),
        new StageBaseModel("order_products", {
            name: "Order products",
            description: "Order the products with your PC",
            onStart: () => mcRoom.addActivity("order_product"),
        }),
        new StageBaseModel("take_products", {
            name: "Take products",
            description: "Take products on the Terrace",
            requestDescriptionToStart: "Wait for the products (2 days)",
            deltaDateRequired: 2,
            onStart: (_, { toast }) => {
                terrace.addActivity("take_product");
                toast("You can take the products on the Terrace");
            },
        }),
    ],
    {
        name: "Help Alice",
        description: "...",
        image: "alice_terrace0A",
        onStart: (quest, { toast }) => toast(`${quest.name} started`),
        onContinue: (stage, { toast }) => toast(`${stage.name} updated`),
    },
);

RegisteredQuests.add(aliceQuest);
```

`QuestProps`: `name`, `description`, `icon`, `image`, `inDevelopment`, `onStart`, `onContinue` (`onNextStage` is deprecated). `StageProps`: `name`, `description`, `adviceDescription`, `image`, `flags` / `flagsRequired` (`{ flag, description }` — Pixi'VN flag names), `questsRequired` (`{ quest, stageNumber }`), `deltaDateRequired` (days after the previous stage ended), `requestDescriptionToStart`, `onStart`, `onEnd`.

## Start / continue

Prefer ink when configured:

```ink
=== start ===
# start quest aliceQuest
-> DONE

=== alice_gave_book ===
# continue quest aliceQuest
-> DONE
```

```ts
await aliceQuest.start(props);     // OnRunProps; pass {} if none
await aliceQuest.continue(props);  // completes current stage and goes on, unconditionally
await aliceQuest.advanceIfCompleted(props); // only if the current stage is completed (flags, etc.)
```

`advanceUnconditionally(props)` skips the completed check. `continue` is what `# continue quest` calls. `advanceIfCompleted` has no ink command.

## Query

| TypeScript | ink variable |
| --- | --- |
| `quest.started` | `aliceQuest_started` |
| `quest.completed` | `aliceQuest_completed` |
| `quest.failed` | `aliceQuest_failed` |
| `quest.currentStageIndex` | `aliceQuest_currentStageIndex` |

Also `quest.inProgress`, `quest.currentStage`, `quest.stages`. `currentStageIndex` goes from `0` to `stages.length - 1`, and equals `stages.length` when completed. In ink use a conditional on the index to select the dialogue per stage:

```ink
{ aliceQuest_currentStageIndex:
- 0: -> talk_alice0
- 1: -> talk_alice1
- else: alice: Thanks again.
}
```

## Fail

`aliceQuest.failed = true;` in TypeScript (no ink command by default; register a custom hashtag command if you need one).

## Get

`RegisteredQuests.get(id)` / `.values()`.

## Custom class

Extend `QuestStoredClass` (`super(id, stages, props)` with `QuestStoredClassProps`), implement `QuestInterface`, augment it in `nqtr.d.ts` with `name`, `description`, `image?`, `inDevelopment`.

## Pitfalls

- Stage `onStart` runs when the stage becomes current; with `deltaDateRequired`/`questsRequired` it may start later (`currentStageMustStart`, `startCurrentStage` are system functions).
- `# continue quest` on a quest that is not started does nothing useful: start it first (`# start quest`).
- Quest variables in ink are read-only and must not be declared with `VAR`.
