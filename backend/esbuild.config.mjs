import { build } from "esbuild";
import { inlineTextPlugin } from "./inline-text.js";

build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/worker.js",
  bundle: true,
  platform: "browser", // for Cloudflare Worker
  format: "esm",
  target: "es2022",
  plugins: [inlineTextPlugin],
});
