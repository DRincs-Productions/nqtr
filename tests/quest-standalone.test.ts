import { beforeEach, expect, test, vi } from "vitest";
import { Game } from "@drincs/pixi-vn";
import { QuestBaseModel, StageBaseModel, timeTracker } from "../src";

beforeEach(() => { Game.clear(); });

test("quests start, advance, complete and fail without navigation or time initialization", async () => {
    const onStart = vi.fn();
    const quest = new QuestBaseModel("standalone", [new StageBaseModel("first", { onStart }), new StageBaseModel("second", {})], {});
    await quest.start({});
    expect(quest.inProgress).toBe(true);
    expect(onStart).toHaveBeenCalledOnce();
    await quest.continue({});
    expect(quest.currentStage?.started).toBe(true);
    await quest.continue({});
    expect(quest.completed).toBe(true);
    const failed = new QuestBaseModel("failed-standalone", [new StageBaseModel("fail-stage", {})], {});
    await failed.start({});
    failed.failed = true;
    expect(failed.failed).toBe(true);
    expect(failed.inProgress).toBe(false);
});

test("time requirements wait until time advances even without initialization", async () => {
    const quest = new QuestBaseModel("timed-standalone", [new StageBaseModel("before", {}), new StageBaseModel("after", { deltaDateRequired: 2 })], {});
    await quest.start({});
    await quest.continue({});
    expect(quest.currentStage?.canStart).toBe(false);
    expect(quest.currentStage?.started).toBe(false);
    timeTracker.currentDate = 2;
    await quest.startCurrentStage({});
    expect(quest.currentStage?.started).toBe(true);
});
