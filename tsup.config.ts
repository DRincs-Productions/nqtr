import { defineConfig } from "tsup";

export default defineConfig([
    {
        target: "es2020",
        entry: {
            registries: "src/registries/index.ts",
        },
        format: ["cjs", "esm"], // Build for commonJS and ESmodules
        dts: true, // Generate declaration file (.d.ts)
        treeshake: true,
        // sourcemap: true, // Generate sourcemap, it was removed because otherwise it would explode
        clean: true,
        minify: true,
        bundle: true,
        skipNodeModulesBundle: false, // Skip bundling of node_modules
        external: ["@drincs/pixi-vn"],
        outExtension({ format }) {
            return {
                js: format === "esm" ? ".mjs" : ".cjs",
            };
        },
    },
    {
        target: "es2020",
        entry: {
            handlers: "src/handlers/index.ts",
        },
        format: ["cjs", "esm"], // Build for commonJS and ESmodules
        dts: true, // Generate declaration file (.d.ts)
        treeshake: true,
        // sourcemap: true, // Generate sourcemap, it was removed because otherwise it would explode
        clean: true,
        minify: true,
        bundle: true,
        skipNodeModulesBundle: false, // Skip bundling of node_modules
        external: ["@drincs/pixi-vn", "@drincs/nqtr/registries"],
        outExtension({ format }) {
            return {
                js: format === "esm" ? ".mjs" : ".cjs",
            };
        },
    },
    {
        target: "es2020",
        entry: {
            ink: "src/ink/index.ts",
        },
        format: ["cjs", "esm"], // Build for commonJS and ESmodules
        dts: true, // Generate declaration file (.d.ts)
        treeshake: true,
        // sourcemap: true, // Generate sourcemap, it was removed because otherwise it would explode
        clean: true,
        minify: true,
        bundle: true,
        skipNodeModulesBundle: false, // Skip bundling of node_modules
        external: ["@drincs/pixi-vn", "@drincs/nqtr/registries", "@drincs/nqtr/handlers"],
        outExtension({ format }) {
            return {
                js: format === "esm" ? ".mjs" : ".cjs",
            };
        },
    },
    {
        target: "es2020",
        entry: {
            index: "src/index.ts",
        },
        format: ["cjs", "esm"], // Build for commonJS and ESmodules
        dts: true, // Generate declaration file (.d.ts)
        treeshake: true,
        // sourcemap: true, // Generate sourcemap, it was removed because otherwise it would explode
        clean: true,
        minify: true,
        bundle: true,
        skipNodeModulesBundle: false, // Skip bundling of node_modules
        external: ["@drincs/pixi-vn", "@drincs/nqtr/registries", "@drincs/nqtr/handlers"],
        outExtension({ format }) {
            return {
                js: format === "esm" ? ".mjs" : ".cjs",
            };
        },
    },
]);
