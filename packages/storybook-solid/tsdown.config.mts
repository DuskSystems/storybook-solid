import { defineConfig } from "tsdown";
import { NodeProtocolPlugin } from "tsdown/plugins";
import solid from "vite-plugin-solid";

export default defineConfig([
  {
    entry: ["src/index.ts", "src/preset.ts", "src/preview.tsx", "src/entry-preview.tsx", "src/entry-preview-docs.tsx"],
    format: ["esm", "cjs"],
    platform: "browser",
    noExternal: ["recast"],
    // @ts-expect-error: Vite plugins not yet supported.
    plugins: [NodeProtocolPlugin(), solid()],
  },

  {
    entry: ["src/preset.ts"],
    format: ["cjs"],
    platform: "browser",
    // @ts-expect-error: Vite plugins not yet supported.
    plugins: [NodeProtocolPlugin(), solid()],
  },
]);
