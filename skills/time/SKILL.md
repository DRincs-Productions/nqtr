---
name: nqtr-time
description: Use when configuring or using the NQTR time system — timeTracker.initialize (dayStartTime, dayEndTime, timeSlots, weekLength, weekendStartDay, getDayName), currentTime/currentDate, increaseTime/increaseDate, nowIsBetween, isWeekend, currentTimeSlot, and the ink commands "# set time", "# set date", "# wait".
---

# NQTR time system

Official docs: [pixi-vn.com/nqtr/time](https://pixi-vn.com/nqtr/time). Index: [nqtr](../getting-started/SKILL.md). Use ink for story-side time changes when available: [nqtr-ink](../ink/SKILL.md).

`date` and `time` are deliberately generic numbers: `time` is the time of day and resets each time `date` increments. Time can mean hours, minutes or an era. Use `timeTracker` (import from `@drincs/nqtr`).

## Initialize (TypeScript, once at startup)

```ts title="main.ts"
import { timeTracker } from "@drincs/nqtr";

timeTracker.initialize({
    defaultTimeSpent: 1,   // default for `# wait`
    dayStartTime: 0,
    dayEndTime: 24,
    timeSlots: [
        { name: "Morning", startTime: 5 },
        { name: "Afternoon", startTime: 12 },
        { name: "Evening", startTime: 18 },
        { name: "Night", startTime: 22 },
    ],
    weekLength: 7,
    weekendStartDay: 6,    // default weekLength - 1
    getDayName: (weekDayNumber) => ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][weekDayNumber],
});
```

Defaults: `dayStartTime 0`, `dayEndTime 24`, `defaultTimeSpent 1`, `timeSlots []`, `weekLength 7`.

## Get / set

```ts
timeTracker.currentTime;      // number
timeTracker.currentDate;      // number
timeTracker.currentTime = 12;
timeTracker.currentDate = 5;
```

```ink
# set time 12
# set time 18.30
# set time 18:30   // ':' is converted to '.' internally
# set date 5
```

## Increment

`increaseTime(delta?)` adds time; past `dayEndTime` it increments the date and restarts from `dayStartTime` plus the overflow. `increaseDate(delta?, time?)` adds days and optionally sets the time.

```ts
timeTracker.increaseTime(2);
timeTracker.increaseDate(1, 8); // +1 day, time 8
```

```ink
# wait                      // + defaultTimeSpent
# wait 2                    // + 2 time units
# wait days 1               // + 1 day, time = dayStartTime
# wait days 1 hours 2       // + 1 day and + 2 time
```

## Queries

| API | Meaning |
| --- | --- |
| `timeTracker.isWeekend` | current day is in the weekend |
| `timeTracker.currentWeekDayNumber` | 0-based weekday index |
| `timeTracker.currentDayName` | via `getDayName` |
| `timeTracker.currentTimeSlot` | index in `timeSlots` of the current slot |
| `timeTracker.nowIsBetween(from, to)` | current time in `[from, to)`; wraps over midnight when `from > to` |

## Time-dependent images

Do not branch manually everywhere: build a small class (`TimeSlotsImage`) holding one image per slot and returning the right one from `timeTracker.currentTimeSlot` in a `src` getter, then use it for room backgrounds/sprites.

## Pitfalls

- Activities/commitments scheduling (`timeSlot: { from, to }`) uses the same time scale: keep `dayEndTime` consistent with the slots you write. A slot with `from > to` (e.g. `{ from: 20, to: 10 }`) wraps over midnight.
- Time changes are not automatic: the story/UI must call `# wait` / `increaseTime` when the player spends time.
