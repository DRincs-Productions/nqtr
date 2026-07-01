import { existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { vitePluginNqtr } from "../src/vite";

/** Registries reported as fully empty, as if no activity/room/quest/etc. has been registered yet. */
function createEmptyRegistriesServer() {
    const empty = { values: () => [] };
    return {
        ssrLoadModule: async (id: string) => {
            if (id === "@drincs/nqtr/registries") {
                return {
                    RegisteredActivities: empty,
                    RegisteredCommitments: empty,
                    RegisteredLocations: empty,
                    RegisteredMaps: empty,
                    RegisteredQuests: empty,
                    RegisteredRooms: empty,
                };
            }
            throw new Error(`unexpected ssrLoadModule(${id})`);
        },
        moduleGraph: { getModulesByFile: () => [] },
        config: { plugins: [] },
    };
}

describe("vitePluginNqtr keys file generation", () => {
    let typeFilePath: string;

    afterEach(() => {
        if (typeFilePath && existsSync(typeFilePath)) rmSync(typeFilePath);
    });

    test("always exports every *IdsEnum, even when every registry is empty", async () => {
        // Regression test: consumers commonly build a `zod.enum(...)` from these ids at module
        // top-level (e.g. `createNqtrHandler`'s validators). If the plugin omits an enum export
        // whenever its id list happens to be empty (e.g. right after a fresh checkout, or after
        // an interrupted dev-server run left the file with no ids), the import resolves to
        // `undefined` and `zod.enum(undefined)` throws — aborting evaluation of the importing
        // module and every sibling module still queued behind it (e.g. other content files
        // glob-imported by the same barrel module).
        typeFilePath = join(tmpdir(), `nqtr-keys-${process.pid}-${Math.random()}.gen.ts`);
        // A pattern matching no files, just so `allPatterns` is non-empty: this makes the
        // plugin defer resolving `contentLoaded` until after `configureServer`'s async setup
        // (readSsrState + tryWriteTypeFile) actually completes, instead of resolving
        // immediately in `configResolved` because there was nothing configured to await.
        const plugin: any = vitePluginNqtr({ typeFilePath, activities: "__none__/*.ts" });
        plugin.configResolved({
            root: tmpdir(),
            plugins: [],
            logger: { info() {}, error() {}, warn() {} },
        });

        const server = createEmptyRegistriesServer();
        plugin.configureServer(server);
        await plugin.api.contentLoaded;

        const content = readFileSync(typeFilePath, "utf-8");
        expect(content).toContain("export const nqtrActivityIdsEnum = {} as const;");
        expect(content).toContain("export const nqtrCommitmentIdsEnum = {} as const;");
        expect(content).toContain("export const nqtrLocationIdsEnum = {} as const;");
        expect(content).toContain("export const nqtrMapIdsEnum = {} as const;");
        expect(content).toContain("export const nqtrQuestIdsEnum = {} as const;");
        expect(content).toContain("export const nqtrRoomIdsEnum = {} as const;");
    });
});
