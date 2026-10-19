import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { Game } from "@drincs/pixi-vn";
import { testing, navigator, timeTracker, routine, RegisteredActivities, RegisteredCommitments, RegisteredQuests, ActivityBaseModel, CommitmentBaseModel, QuestBaseModel, StageBaseModel } from "../src";
import { alice, mcRoom, terrace } from "./setup";

beforeEach(() => { Game.clear(); testing.disable(); testing.setProps({}); testing.setActions({}); });
afterEach(() => { testing.disable(); testing.setActions({}); vi.restoreAllMocks(); });

test("session lifecycle, custom keys, and foreign window values", () => {
    const api = testing.enable({ windowKey: "nqtrTest" });
    expect((window as any).nqtrTest).toBe(api);
    expect(testing.isEnabled()).toBe(true);
    const replacement = testing.enable();
    expect((window as any).nqtrTest).toBeUndefined();
    (window as any).nqtr = "foreign";
    testing.disable();
    expect((window as any).nqtr).toBe("foreign");
    delete (window as any).nqtr;
    expect(testing.isEnabled()).toBe(false);
    expect(replacement).not.toBe(api);
});

test("navigation, time and activity edits update direct reads", async () => {
    const api = testing.enable();
    await api.goToRoom(mcRoom.id);
    expect(api.getCurrentRoom()?.id).toBe(mcRoom.id);
    const date = timeTracker.currentDate;
    await api.increaseDate(1, 8);
    expect(timeTracker.currentDate).toBe(date + 1);
    expect(timeTracker.currentTime).toBe(8);
    await api.increaseTime(2);
    expect(timeTracker.currentTime).toBe(10);
    await api.addActivity(mcRoom.id, "order_product");
    expect(mcRoom.activitiesIds).toContain("order_product");
    await api.removeActivity(mcRoom.id, "order_product");
    expect(mcRoom.activitiesIds).not.toContain("order_product");
    expect(api.getRooms()).toContain(mcRoom);
    expect(api.getActivities().some(item => item.id === "order_product")).toBe(true);
});

test("commitment edits and routine reads", async () => {
    const item = new CommitmentBaseModel("testing-commit", alice, { priority: 100, onRun: () => {} });
    RegisteredCommitments.add(item);
    const api = testing.enable();
    await api.addCommitment(terrace.id, item.id);
    expect(routine.commitmentsIds).toContain(item.id);
    expect(api.getCommitments()).toContain(item);
    expect(api.getRoutine()).toContain(item);
    await api.removeRoutine(item.id);
    expect(routine.commitmentsIds).not.toContain(item.id);
});

test("run and quest actions use current props and await callbacks", async () => {
    const run = vi.fn(async (_item, props) => props.marker);
    const item = new ActivityBaseModel("testing-run", run, {});
    const commit = new CommitmentBaseModel("testing-run-commit", alice, { onRun: run });
    RegisteredActivities.add(item); RegisteredCommitments.add(commit);
    const quest = new QuestBaseModel("testing-quest", [new StageBaseModel("one", {}), new StageBaseModel("two", {})], {});
    RegisteredQuests.add(quest);
    const start = vi.spyOn(quest, "start").mockResolvedValue();
    const next = vi.spyOn(quest, "continue").mockResolvedValue(true);
    const api = testing.enable();
    testing.setProps({ marker: "fresh" } as any);
    await api.runActivity(item.id);
    expect(run).toHaveBeenLastCalledWith(item, { marker: "fresh" });
    await api.runCommitment(commit.id);
    expect(run).toHaveBeenLastCalledWith(commit, { marker: "fresh" });
    await api.startQuest(quest.id);
    expect(await api.continueQuest(quest.id)).toBe(true);
    expect(start).toHaveBeenCalledWith({ marker: "fresh" });
    expect(next).toHaveBeenCalledWith({ marker: "fresh" });
    expect(api.getQuests()).toContain(quest);
});

test("live overrides are awaited and omitted actions keep defaults", async () => {
    const api = testing.enable();
    let done = false;
    testing.setActions({ increaseTime: async () => { await Promise.resolve(); done = true; } });
    await api.increaseTime(2);
    expect(done).toBe(true);
    await api.goToRoom(mcRoom.id);
    expect(navigator.currentRoomId).toBe(mcRoom.id);
    testing.setActions({});
    await api.increaseDate(1, 8);
    await api.increaseTime(2);
    expect(timeTracker.currentTime).toBe(10);
});

test("unknown IDs reject without changing the room", async () => {
    const api = testing.enable();
    await api.goToRoom(mcRoom.id);
    await expect(api.goToRoom("missing")).rejects.toThrow("unknown room");
    await expect(api.addActivity(mcRoom.id, "missing")).rejects.toThrow("unknown activity");
    await expect(api.runCommitment("missing")).rejects.toThrow("unknown commitment");
    await expect(api.startQuest("missing")).rejects.toThrow("unknown quest");
    expect(navigator.currentRoomId).toBe(mcRoom.id);
});
