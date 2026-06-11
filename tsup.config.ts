import { defineConfig, type Options } from "tsup";

export default defineConfig((options) => {
    const sourcemap = Boolean(options.watch);
    const createConfig = (config: Options): Options => ({
        sourcemap,
        esbuildOptions(opts) {
            // Force-transpile private class fields/methods to WeakMaps.
            // Keeping es2022 target ensures useDefineForClassFields:true so arrow-function
            // class fields stay as native class fields (outside the constructor body),
            // avoiding the Babel super()-in-arrow-function error in CRA/react-scripts.
            opts.supported = {
                ...opts.supported,
                "class-private-field": false,
                "class-private-method": false,
                "class-private-accessor": false,
                "class-private-static-field": false,
                "class-private-static-method": false,
                "class-private-static-accessor": false,
            };
        },
        ...config,
    });

    return [
        createConfig({
            target: "es2022",
            entry: {
                registries: "src/registries/index.ts",
            },
            format: ["cjs", "esm"],
            dts: false,
            treeshake: true,
            clean: true,
            minify: true,
            bundle: true,
            skipNodeModulesBundle: false,
            external: ["@drincs/pixi-vn"],
            outExtension({ format }) {
                return {
                    js: format === "esm" ? ".mjs" : ".cjs",
                };
            },
        }),
        createConfig({
            target: "es2022",
            entry: {
                handlers: "src/handlers/index.ts",
            },
            format: ["cjs", "esm"],
            dts: false,
            treeshake: true,
            clean: false,
            minify: true,
            bundle: true,
            skipNodeModulesBundle: false,
            external: ["@drincs/pixi-vn", "@drincs/nqtr/registries"],
            outExtension({ format }) {
                return {
                    js: format === "esm" ? ".mjs" : ".cjs",
                };
            },
        }),
        createConfig({
            target: "es2022",
            entry: {
                ink: "src/ink/index.ts",
            },
            format: ["cjs", "esm"],
            dts: false,
            treeshake: true,
            clean: false,
            minify: true,
            bundle: true,
            skipNodeModulesBundle: false,
            external: ["@drincs/pixi-vn", "@drincs/nqtr/registries", "@drincs/nqtr/handlers", "@drincs/pixi-vn-ink"],
            outExtension({ format }) {
                return {
                    js: format === "esm" ? ".mjs" : ".cjs",
                };
            },
        }),
        createConfig({
            target: "es2022",
            entry: {
                index: "src/index.ts",
            },
            format: ["cjs", "esm"],
            dts: false,
            treeshake: true,
            clean: false,
            minify: true,
            bundle: true,
            skipNodeModulesBundle: false,
            external: ["@drincs/pixi-vn", "@drincs/nqtr/registries", "@drincs/nqtr/handlers"],
            outExtension({ format }) {
                return {
                    js: format === "esm" ? ".mjs" : ".cjs",
                };
            },
        }),
        createConfig({
            target: "es2022",
            entry: {
                registries: "src/registries/index.ts",
                handlers: "src/handlers/index.ts",
                ink: "src/ink/index.ts",
                index: "src/index.ts",
            },
            format: ["cjs", "esm"],
            dts: { only: true },
            clean: false,
            external: [
                "@drincs/pixi-vn",
                "@drincs/nqtr/registries",
                "@drincs/nqtr/handlers",
                "@drincs/pixi-vn-ink",
            ],
        }),
    ];
});
