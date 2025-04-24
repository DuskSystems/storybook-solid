import { defineConfig } from "tsdown";
import solid from "vite-plugin-solid";

// @ts-expect-error: Vite plugins not yet supported.
export default defineConfig([
  {
    entry: ["src/index.ts", "src/node/index.ts"],
    format: ["esm", "cjs"],
    platform: "node",
    plugins: [solid()],
  },

  {
    entry: ["src/preset.ts"],
    format: ["cjs"],
    platform: "node",
    plugins: [solid()],
  },
]);
