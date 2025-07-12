import { test } from "vitest";
import { mcRoom, orderProduct } from "./setup.test";

test("choice A", async () => {
    mcRoom.addActivity(orderProduct);
    const activities1 = mcRoom.activities;
    mcRoom.removeActivity(orderProduct);
    const activities2 = mcRoom.activities;
});
