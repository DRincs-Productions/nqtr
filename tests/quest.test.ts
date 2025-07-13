import { test } from "vitest";
import { QuestBaseModel, RegisteredQuests, StageBaseModel } from "../src";

const aliceQuest = new QuestBaseModel(
    "aliceQuest",
    [
        // stages
        new StageBaseModel("talk_alice1", {
            onStart: () => {},
            name: "Talk to Alice",
            description: "Talk to Alice on the terrace",
        }),
        new StageBaseModel("order_products", {
            onStart: () => {},
            name: "Order products",
            description: "Order the products with your PC",
        }),
        new StageBaseModel("take_products", {
            onStart: () => {},
            name: "Take products",
            description: "Take products on the Terrace",
            requestDescriptionToStart: "Wait for the products you ordered to arrive (2 day)",
            deltaDateRequired: 2,
        }),
        new StageBaseModel("talk_alice2", {
            name: "Talk to Alice",
            description: "Talk to Alice on the terrace",
        }),
    ],
    {
        // props
        name: "Help Alice",
        description:
            'To learn more about how the repo works, Talk to Alice. \nGoing when she is there will automatically start an "Event" (see aliceQuest.tsx to learn more). \nAfter that an action will be added to open the pc, in MC room. \n\n(during the quest you can talk to Alice and you will see her talking during the quests of the same Quest)',
    }
);
RegisteredQuests.add(aliceQuest);

test("aliceQuest", async () => {});
