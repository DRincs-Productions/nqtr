import { expect, test } from "vitest";
import { mcRoom, orderProduct } from "./setup.test";

test("removeActivity", async () => {
    mcRoom.addActivity(orderProduct);
    const activities1 = mcRoom.activities;
    expect(activities1.length).toBe(2);
    mcRoom.removeActivity(orderProduct);
    const activities2 = mcRoom.activities;
    expect(activities2.length).toBe(1);
});
