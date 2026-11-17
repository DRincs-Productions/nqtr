import { afterEach, expect, test, vi } from "vitest";
import { HashtagCommands, VariableGetter } from "@drincs/pixi-vn-ink";
import { createNqtrHandler } from "../src/ink/nqtrHandler";

afterEach(() => vi.restoreAllMocks());

const groups = {
    navigation: ["Enter room"],
    time: ["Set time", "Set date", "Wait for time", "Wait", "Wait with options"],
    activity: ["Add activity to room", "Remove activity from room"],
    routine: ["Add commitment to room", "Remove commitment from room"],
    quest: ["Start quest", "Continue quest"],
};
for (const [section, names] of Object.entries(groups)) {
    test(`registers only ${section} commands`, () => {
        const add = vi.spyOn(HashtagCommands, "add").mockImplementation(() => {});
        const getter = vi.spyOn(VariableGetter, "add").mockImplementation(() => {});
        createNqtrHandler({ sections: { [section]: true } });
        expect(add.mock.calls.map((call) => call[1]?.name)).toEqual(names);
        expect(getter).toHaveBeenCalledTimes(section === "quest" ? 1 : 0);
    });
}
test("omitting sections preserves all commands", () => {
    const add = vi.spyOn(HashtagCommands, "add").mockImplementation(() => {});
    vi.spyOn(VariableGetter, "add").mockImplementation(() => {});
    createNqtrHandler();
    expect(add).toHaveBeenCalledTimes(12);
});
test("empty sections registers nothing", () => {
    const add = vi.spyOn(HashtagCommands, "add").mockImplementation(() => {});
    const getter = vi.spyOn(VariableGetter, "add").mockImplementation(() => {});
    createNqtrHandler({ sections: {} });
    expect(add).not.toHaveBeenCalled();
    expect(getter).not.toHaveBeenCalled();
});
