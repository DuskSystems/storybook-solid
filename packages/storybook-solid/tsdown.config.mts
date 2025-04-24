import { defineConfig } from "tsdown";
import { NodeProtocolPlugin } from "tsdown/plugins";
import solid from "vite-plugin-solid";

// @ts-expect-error: Vite plugins not yet supported.
export default defineConfig([
  {
    entry: ["src/index.ts", "src/preset.ts", "src/preview.tsx", "src/entry-preview.tsx", "src/entry-preview-docs.tsx"],
    format: ["esm", "cjs"],
    platform: "browser",
    plugins: [NodeProtocolPlugin(), solid()],
  },

  {
    entry: ["src/preset.ts"],
    format: ["cjs"],
    platform: "node",
    plugins: [solid()],
  },
]);
