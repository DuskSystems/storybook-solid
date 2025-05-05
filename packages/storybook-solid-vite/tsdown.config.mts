import { defineConfig } from "tsdown";
import solid from "vite-plugin-solid";

export default defineConfig([
  {
    entry: ["src/index.ts", "src/node/index.ts"],
    format: ["esm", "cjs"],
    platform: "node",
    // @ts-expect-error: Vite plugins not yet supported.
    plugins: [solid()],
  },

  {
    entry: ["src/preset.ts"],
    format: ["cjs"],
    platform: "node",
    // @ts-expect-error: Vite plugins not yet supported.
    plugins: [solid()],
  },
]);
