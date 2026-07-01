import { existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";
import { vitePluginNqtr } from "../src/vite";

let capturedTempServerConfig: any;

vi.mock("vite", async (importOriginal) => {
    const actual = await importOriginal<typeof import("vite")>();
    return {
        ...actual,
        createServer: vi.fn(async (config: any) => {
            capturedTempServerConfig = config;
            return {
                ssrLoadModule: async () => ({}),
                close: async () => {},
            };
        }),
    };
});

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

describe("vitePluginNqtr enforce tier", () => {
    test("must not be 'post' — vite-plugin-ink awaits this plugin's contentLoaded from its own 'pre'-tier buildStart", () => {
        // Regression test: `vite build` batches the async `buildStart` Rollup hook by Vite's
        // enforce tier — every "pre"-tier plugin's `buildStart` must settle before any "post"
        // plugin's `buildStart` is even invoked. `vite-plugin-ink` (enforce: "pre") awaits this
        // plugin's `api.contentLoaded` inside its own `buildStart`. If this plugin were "post",
        // ink's "pre"-tier buildStart would never settle (it's waiting on a plugin whose
        // buildStart hasn't started yet), and the "post" tier — including this plugin's own
        // buildStart — would never start either: a permanent deadlock that hangs `vite build`
        // indefinitely. This plugin defines no resolveId/load/transform hook, so `enforce` has
        // no effect on anything else here — there is no reason to ever set it back to "post".
        const plugin = vitePluginNqtr();
        expect(plugin.enforce).not.toBe("post");
    });
});

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

describe("vitePluginNqtr buildStart (build mode)", () => {
    afterEach(() => {
        capturedTempServerConfig = undefined;
    });

    test("forwards the project's resolved alias config to the temp SSR server", async () => {
        // Regression test: `buildStart` (build mode) loads content via a bare `createServer()`
        // call with `configFile: false`. Without forwarding `resolve` from the real
        // `resolvedConfig`, that temp server has no idea how to resolve path aliases (e.g. `@/`
        // from `resolve.tsconfigPaths` or a manual `resolve.alias`) — so activities/rooms/
        // quests/etc. content files (which almost always use them) silently fail to load, and
        // every NQTR registry ends up empty in the generated keys file.
        const fakeResolve = { alias: [{ find: "@", replacement: "/fake/src" }] };
        const plugin: any = vitePluginNqtr({ activities: "./src/content/activities.tsx" });
        plugin.configResolved({
            root: tmpdir(),
            command: "build",
            plugins: [],
            resolve: fakeResolve,
            logger: { info() {}, error() {}, warn() {} },
        });

        await plugin.buildStart();

        expect(capturedTempServerConfig?.resolve).toBe(fakeResolve);
    });
});
