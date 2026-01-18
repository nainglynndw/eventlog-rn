import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "viewer/index": "src/viewer/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: false,
  minify: false,
  treeshake: true,
  splitting: false,
  external: [
    "react-native",
    "react",
    "react-native-mmkv",
    "react-native-nitro-modules",
  ],
});
