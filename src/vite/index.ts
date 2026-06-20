import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import pc from "picocolors";
import { glob } from "tinyglobby";
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";

const PLUGIN_PREFIX = pc.cyan("(nqtr)");

function asArray(value: string | string[] | undefined): string[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

/**
 * Shape of the `vite-plugin-pixi-vn` plugin API that this plugin consumes.
 * Only `contentLoaded` and `onReload` are used; the full type is not imported
 * to avoid a hard dependency on the `@drincs/pixi-vn` package.
 */
type PixivnPlugin = Plugin & {
    api?: {
        /** Resolves once all pixi-vn content modules have finished loading. */
        contentLoaded?: Promise<void>;
        /**
         * Registers a callback that fires after every hot-content-reload
         * triggered by the pixi-vn plugin.
         */
        onReload?: (cb: () => void) => void;
    };
};

function getPixivnPlugin(plugins?: readonly Plugin[]): PixivnPlugin | undefined {
    return plugins?.find((p) => p.name === "vite-plugin-pixi-vn") as PixivnPlugin | undefined;
}

// ── Internal state ────────────────────────────────────────────────────────────

type NqtrIds = {
    activityIds: string[];
    commitmentIds: string[];
    locationIds: string[];
    mapIds: string[];
    questIds: string[];
    roomIds: string[];
};

/** Shape of `@drincs/nqtr/registries` as seen through SSR's dynamic import. */
type RegistriesMod = {
    RegisteredActivities?: { values(): Array<{ id: string }>; clear?(): void };
    RegisteredCommitments?: { values(): Array<{ id: string }>; clear?(): void };
    RegisteredLocations?: { values(): Array<{ id: string }>; clear?(): void };
    RegisteredMaps?: { values(): Array<{ id: string }>; clear?(): void };
    RegisteredQuests?: { values(): Array<{ id: string }>; clear?(): void };
    RegisteredRooms?: { values(): Array<{ id: string }>; clear?(): void };
};

// ── Options ───────────────────────────────────────────────────────────────────

/**
 * Options for {@link vitePluginNqtr}.
 */
export interface VitePluginNqtrOptions {
    /**
     * Glob / path of module(s) whose side effects register activities via
     * `RegisteredActivities.add(...)`.
     *
     * @example "./src/activities.ts"
     * @example "./src/activities/*.ts"
     */
    activities?: string | string[];

    /**
     * Glob / path of module(s) whose side effects register commitments via
     * `RegisteredCommitments.add(...)`.
     *
     * @example "./src/commitments.ts"
     */
    commitments?: string | string[];

    /**
     * Glob / path of module(s) whose side effects register quests via
     * `RegisteredQuests.add(...)`.
     *
     * @example "./src/quests.ts"
     * @example "./src/*.quest.ts"
     */
    quests?: string | string[];

    /**
     * Glob / path of module(s) whose side effects register rooms via
     * `RegisteredRooms.add(...)`.
     *
     * @example "./src/rooms.ts"
     */
    rooms?: string | string[];

    /**
     * Path to the auto-generated TypeScript file that contains both:
     * - `as const` runtime arrays of all currently known entity IDs
     *   (e.g. `nqtrActivityIds`, `nqtrRoomIds`, …) — import these into
     *   {@link createNqtrHandler} for runtime validation of Ink hashtag commands.
     * - a `declare module` augmentation of the six `Nqtr*Ids` interfaces in
     *   `@drincs/nqtr/registries` — gives compile-time–safe ID types once the
     *   file is included in the project's TypeScript compilation.
     *
     * When provided, the plugin generates (or overwrites) this file:
     * - after all content modules have been loaded at startup,
     * - after every hot-reload of a watched content file.
     *
     * The generated file is **excluded from HMR** so that regenerating it
     * never triggers a full-page reload.
     *
     * The path may be absolute or relative to Vite `root`.
     *
     * @example "./src/nqtr.keys.gen.ts"
     */
    typeFilePath?: string;
}

// ── Plugin ────────────────────────────────────────────────────────────────────

/**
 * Creates a Vite plugin that generates TypeScript declaration files with
 * compile-time–safe ID types for all six NQTR entity registries:
 * activities, commitments, locations, maps, quests, and rooms.
 *
 * ---
 *
 * **How it works**
 *
 * At startup (and after every hot-module reload), the plugin executes the
 * content modules listed in the options server-side via Vite SSR.  Those
 * modules register entities by calling `RegisteredActivities.add(...)`,
 * `RegisteredRooms.add(...)`, etc.  The plugin then reads back the IDs from
 * all six registries and writes a `.d.ts` declaration file that augments the
 * `Nqtr*Ids` interfaces in `@drincs/nqtr/registries`.
 *
 * ---
 *
 * **Pixi-VN integration**
 *
 * If `vitePluginPixivn` (from `@drincs/pixi-vn/vite`) is present in the same
 * Vite config, this plugin automatically waits for its `contentLoaded`
 * signal before reading registry state.  This means you can pass a single
 * `content` barrel file to `vitePluginPixivn` and have both plugins read from
 * it without duplicating the option:
 *
 * ```ts
 * // vite.config.ts
 * import { vitePluginPixivn } from "@drincs/pixi-vn/vite";
 * import { vitePluginNqtr } from "@drincs/nqtr/vite";
 *
 * export default defineConfig({
 *   plugins: [
 *     vitePluginPixivn({ content: "./src/content/index.ts" }),
 *     vitePluginNqtr({ typeFilePath: "./src/nqtr.keys.gen.ts" }),
 *   ],
 * });
 * ```
 *
 * The nqtr plugin will piggy-back on pixi-vn's content loading and re-run
 * type generation on every hot-reload triggered by the pixi-vn plugin.
 *
 * ---
 *
 * **Standalone usage** (without pixi-vn)
 *
 * Target specific entity files directly:
 *
 * ```ts
 * vitePluginNqtr({
 *   rooms:        "./src/rooms.ts",
 *   activities:   "./src/activities/*.ts",
 *   typeFilePath: "./src/nqtr.keys.gen.ts",
 * })
 * ```
 *
 * ---
 *
 * **Generated file**
 *
 * The file written to {@link VitePluginNqtrOptions.typeFilePath} looks like:
 *
 * ```ts
 * // nqtr.keys.gen.ts  — auto-generated, do not edit manually
 * export const nqtrActivityIds = ["study", "cook"] as const;
 * export const nqtrRoomIds = ["bedroom", "kitchen"] as const;
 * // …
 *
 * declare module "@drincs/nqtr/registries" {
 *     interface NqtrActivityIds { "study": never; "cook": never; }
 *     interface NqtrRoomIds     { "bedroom": never; "kitchen": never; }
 *     // …
 * }
 * ```
 *
 * The `as const` arrays can be passed to {@link createNqtrHandler} for runtime
 * validation of Ink hashtag commands. The `declare module` augmentation narrows
 * the `*IdType` helpers (`ActivityIdType`, `RoomIdType`, …) from `string` to
 * the union of known literal IDs at compile time.
 *
 * @param options - Optional plugin configuration.
 * @returns A Vite plugin.
 */
export function vitePluginNqtr(options?: VitePluginNqtrOptions): Plugin {
    let resolvedConfig: ResolvedConfig | undefined;
    let pixivnPlugin: PixivnPlugin | undefined;

    let contentLoadedResolve!: () => void;
    /**
     * Resolves once all NQTR content has been loaded and the type file (if
     * configured) has been written for the first time.
     */
    const contentLoaded = new Promise<void>((res) => {
        contentLoadedResolve = res;
    });

    const allPatterns = [
        ...asArray(options?.activities),
        ...asArray(options?.commitments),
        ...asArray(options?.rooms),
        ...asArray(options?.quests),
    ];

    const watchedFiles = new Set<string>();
    let state: NqtrIds = {
        activityIds: [],
        commitmentIds: [],
        locationIds: [],
        mapIds: [],
        questIds: [],
        roomIds: [],
    };

    // ── Helpers ───────────────────────────────────────────────────────────────

    function getAbsTypeFilePath(): string | null {
        if (!options?.typeFilePath || !resolvedConfig) return null;
        const p = options.typeFilePath;
        return isAbsolute(p) ? p : resolve(resolvedConfig.root, p);
    }

    function writeTypeFile(filePath: string, ids: NqtrIds): void {
        mkdirSync(dirname(filePath), { recursive: true });

        const lines: string[] = [
            "// @ts-nocheck",
            "/* eslint-disable */",
            "// noinspection JSUnusedGlobalSymbols",
            "// This file is auto-generated by @drincs/nqtr vite plugin. Do not edit manually.",
            "",
            `export const nqtrActivityIds = ${JSON.stringify(ids.activityIds)} as const;`,
            `export const nqtrCommitmentIds = ${JSON.stringify(ids.commitmentIds)} as const;`,
            `export const nqtrLocationIds = ${JSON.stringify(ids.locationIds)} as const;`,
            `export const nqtrMapIds = ${JSON.stringify(ids.mapIds)} as const;`,
            `export const nqtrQuestIds = ${JSON.stringify(ids.questIds)} as const;`,
            `export const nqtrRoomIds = ${JSON.stringify(ids.roomIds)} as const;`,
            "",
            `declare module "@drincs/nqtr/registries" {`,
        ];

        const sections: Array<[string, string[]]> = [
            ["NqtrActivityIds", ids.activityIds],
            ["NqtrCommitmentIds", ids.commitmentIds],
            ["NqtrLocationIds", ids.locationIds],
            ["NqtrMapIds", ids.mapIds],
            ["NqtrQuestIds", ids.questIds],
            ["NqtrRoomIds", ids.roomIds],
        ];

        for (const [interfaceName, idList] of sections) {
            if (idList.length === 0) continue;
            lines.push(`    interface ${interfaceName} {`);
            for (const id of idList) {
                lines.push(`        ${JSON.stringify(id)}: never;`);
            }
            lines.push(`    }`);
        }

        lines.push(`}`);
        lines.push("");

        writeFileSync(filePath, lines.join("\n"), "utf-8");
    }

    function tryWriteTypeFile(): void {
        const absPath = getAbsTypeFilePath();
        if (!absPath) return;
        try {
            writeTypeFile(absPath, state);
        } catch (error) {
            resolvedConfig?.logger.error(
                `${PLUGIN_PREFIX} Failed to write type file "${absPath}".`,
                {
                    error: error instanceof Error ? error : new Error(String(error)),
                    timestamp: true,
                },
            );
        }
    }

    async function readSsrState(ssrLoadModule: (url: string) => Promise<unknown>): Promise<void> {
        let mod: RegistriesMod = {};
        try {
            mod = (await ssrLoadModule("@drincs/nqtr/registries")) as RegistriesMod;
        } catch {
            /* registry module not available in this SSR context */
        }

        state = {
            activityIds: mod.RegisteredActivities?.values().map((a) => a.id) ?? [],
            commitmentIds: mod.RegisteredCommitments?.values().map((c) => c.id) ?? [],
            locationIds: mod.RegisteredLocations?.values().map((l) => l.id) ?? [],
            mapIds: mod.RegisteredMaps?.values().map((m) => m.id) ?? [],
            questIds: mod.RegisteredQuests?.values().map((q) => q.id) ?? [],
            roomIds: mod.RegisteredRooms?.values().map((r) => r.id) ?? [],
        };

        const total =
            state.activityIds.length +
            state.commitmentIds.length +
            state.locationIds.length +
            state.mapIds.length +
            state.questIds.length +
            state.roomIds.length;

        resolvedConfig?.logger.info(
            `${PLUGIN_PREFIX} ${pc.dim(
                `${total} NQTR id(s) — activities: ${state.activityIds.length}, ` +
                    `commitments: ${state.commitmentIds.length}, ` +
                    `locations: ${state.locationIds.length}, ` +
                    `maps: ${state.mapIds.length}, ` +
                    `quests: ${state.questIds.length}, ` +
                    `rooms: ${state.roomIds.length}`,
            )}`,
            { timestamp: true },
        );
    }

    async function clearSsrRegistries(
        ssrLoadModule: (url: string) => Promise<unknown>,
    ): Promise<void> {
        try {
            const mod = (await ssrLoadModule("@drincs/nqtr/registries")) as RegistriesMod;
            mod.RegisteredActivities?.clear?.();
            mod.RegisteredCommitments?.clear?.();
            mod.RegisteredLocations?.clear?.();
            mod.RegisteredMaps?.clear?.();
            mod.RegisteredQuests?.clear?.();
            mod.RegisteredRooms?.clear?.();
        } catch {
            /* ignore */
        }
    }

    async function loadOwnModules(
        ssrLoadModule: (url: string) => Promise<unknown>,
        root: string,
    ): Promise<void> {
        const files = await glob(allPatterns, { cwd: root, absolute: true, onlyFiles: true });
        for (const file of files) {
            watchedFiles.add(file);
            try {
                await ssrLoadModule(file);
            } catch {
                /* ignore individual file errors */
            }
        }
    }

    async function reloadContent(server: ViteDevServer): Promise<void> {
        // Invalidate watched files from Vite's SSR module graph so they are
        // re-executed on the next ssrLoadModule call.
        for (const file of watchedFiles) {
            for (const mod of server.moduleGraph.getModulesByFile(file) ?? []) {
                server.moduleGraph.invalidateModule(mod);
            }
        }
        await clearSsrRegistries((p) => server.ssrLoadModule(p));
        await loadOwnModules((p) => server.ssrLoadModule(p), resolvedConfig!.root);
        await readSsrState((p) => server.ssrLoadModule(p));
        tryWriteTypeFile();
    }

    // ── Plugin hooks ──────────────────────────────────────────────────────────

    return {
        name: "vite-plugin-nqtr",
        // Run after vite-plugin-pixi-vn so its content is loaded first.
        enforce: "post",

        api: {
            /** Resolves once NQTR content has been loaded and types generated. */
            contentLoaded,
        },

        config(_, env) {
            // When the plugin owns content loading, ensure @drincs/nqtr (and its
            // dependency @drincs/pixi-vn) go through Vite's SSR module graph so
            // that the CachedMap singletons populated by user content files are
            // the same instances we read back in readSsrState.
            if (env.command === "serve" && allPatterns.length > 0) {
                return { ssr: { noExternal: ["@drincs/nqtr", "@drincs/pixi-vn"] } };
            }
        },

        configResolved(config) {
            resolvedConfig = config;
            pixivnPlugin = getPixivnPlugin(config.plugins);

            // Nothing to do — resolve immediately so downstream plugins do not
            // hang waiting for contentLoaded.
            if (allPatterns.length === 0 && !pixivnPlugin?.api?.contentLoaded) {
                contentLoadedResolve();
            }
        },

        async buildStart() {
            if (resolvedConfig?.command !== "build") return;

            // Wait for pixi-vn to finish loading content (if present).
            // pixi-vn loads content in its own temp Vite server; after it closes,
            // the nqtr registries remain populated in Node's native ESM cache
            // because @drincs/nqtr is external to pixi-vn's SSR context.
            const pixivnContentLoaded = pixivnPlugin?.api?.contentLoaded;
            if (pixivnContentLoaded) await pixivnContentLoaded;

            if (allPatterns.length > 0) {
                // Load our own content patterns inside a dedicated temp server so
                // that SSR module instances are consistent with readSsrState.
                const { createServer } = await import("vite");
                const tempServer = await createServer({
                    root: resolvedConfig!.root,
                    configFile: false,
                    server: { middlewareMode: true },
                    appType: "custom",
                    logLevel: "silent",
                    optimizeDeps: { noDiscovery: true },
                    ssr: { noExternal: ["@drincs/nqtr", "@drincs/pixi-vn"] },
                });
                try {
                    await loadOwnModules((p) => tempServer.ssrLoadModule(p), resolvedConfig!.root);
                    await readSsrState((p) => tempServer.ssrLoadModule(p));
                    tryWriteTypeFile();
                                contentLoadedResolve();
                } catch {
                    contentLoadedResolve();
                } finally {
                    await tempServer.close();
                }
            } else if (pixivnContentLoaded) {
                // pixi-vn loaded the content; nqtr registries are now in Node's
                // native ESM module cache — read them directly via dynamic import.
                try {
                    const mod = (await import("@drincs/nqtr/registries")) as RegistriesMod;
                    state = {
                        activityIds: mod.RegisteredActivities?.values().map((a) => a.id) ?? [],
                        commitmentIds: mod.RegisteredCommitments?.values().map((c) => c.id) ?? [],
                        locationIds: mod.RegisteredLocations?.values().map((l) => l.id) ?? [],
                        mapIds: mod.RegisteredMaps?.values().map((m) => m.id) ?? [],
                        questIds: mod.RegisteredQuests?.values().map((q) => q.id) ?? [],
                        roomIds: mod.RegisteredRooms?.values().map((r) => r.id) ?? [],
                    };
                    tryWriteTypeFile();
                            } catch {
                    /* ignore */
                }
                contentLoadedResolve();
            } else {
                contentLoadedResolve();
            }
        },

        configureServer(server) {
            const setup = async () => {
                // Wait for pixi-vn to load its content first (if present).
                const pixivnContentLoaded = pixivnPlugin?.api?.contentLoaded;
                if (pixivnContentLoaded) await pixivnContentLoaded;

                if (allPatterns.length > 0) {
                    await loadOwnModules((p) => server.ssrLoadModule(p), resolvedConfig!.root);
                }

                await readSsrState((p) => server.ssrLoadModule(p));
                tryWriteTypeFile();
                        contentLoadedResolve();

                // Re-generate types whenever pixi-vn reloads content (HMR for
                // pixi-vn-owned content files).
                pixivnPlugin?.api?.onReload?.(() => {
                    void readSsrState((p) => server.ssrLoadModule(p))
                        .then(() => tryWriteTypeFile())
                        .catch((error) => {
                            resolvedConfig?.logger.error(
                                `${PLUGIN_PREFIX} Failed to regenerate types after pixi-vn reload.`,
                                {
                                    error:
                                        error instanceof Error ? error : new Error(String(error)),
                                    timestamp: true,
                                },
                            );
                        });
                });
            };

            void setup().catch(() => contentLoadedResolve());
        },

        hotUpdate({ file, server }) {
            // Never send HMR for the generated file — regenerating it
            // should not trigger a full-page reload.
            const absTypeFilePath = getAbsTypeFilePath();
            if (absTypeFilePath && file === absTypeFilePath) {
                return [];
            }

            // For content files this plugin owns, do a full registry reload and
            // regenerate the type file.
            if (allPatterns.length > 0 && watchedFiles.has(file)) {
                void reloadContent(server).catch((error) => {
                    resolvedConfig?.logger.error(
                        `${PLUGIN_PREFIX} Failed to reload NQTR content.`,
                        {
                            error: error instanceof Error ? error : new Error(String(error)),
                            timestamp: true,
                        },
                    );
                });
                return [];
            }
        },
    };
}
