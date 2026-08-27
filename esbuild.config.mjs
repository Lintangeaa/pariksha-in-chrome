import * as esbuild from "esbuild";
import { readFileSync } from "node:fs";

const watch = process.argv.includes("--watch");

// Loaded manually (not `dotenv`) to keep the build script dependency-free —
// this only needs KEY="value" lines, not dotenv's full feature set.
function loadEnvFile(path) {
  try {
    const content = readFileSync(path, "utf-8");
    const env = {};
    for (const line of content.split("\n")) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match) env[match[1]] = match[2].replace(/^"|"$/g, "");
    }
    return env;
  } catch {
    return {};
  }
}

const env = loadEnvFile(".env");

const define = {
  "process.env.PARIKSHA_BACKEND_URL": JSON.stringify(
    env.PARIKSHA_BACKEND_URL || "http://localhost:3001",
  ),
};

const shared = {
  bundle: true,
  outdir: "dist",
  target: "chrome110",
  define,
  logLevel: "info",
  // The floating button + panel (src/content/panel/*.tsx) are Preact —
  // automatic JSX runtime pointed at "preact" instead of React.
  jsx: "automatic",
  jsxImportSource: "preact",
};

// background.js runs as a manifest `"type": "module"` service worker — ESM.
// content-script.js is injected via manifest `content_scripts`, which does
// NOT run as a module, so it must stay a classic (IIFE) script (this is also
// where the Preact floating button/panel UI is bundled in, since it's
// mounted from the content script).
const esmBuild = {
  ...shared,
  format: "esm",
  entryPoints: {
    background: "src/background/background.ts",
  },
};
const iifeBuild = {
  ...shared,
  format: "iife",
  entryPoints: {
    "content-script": "src/content/content-script.ts",
  },
};

if (watch) {
  const [esmCtx, iifeCtx] = await Promise.all([
    esbuild.context(esmBuild),
    esbuild.context(iifeBuild),
  ]);
  await Promise.all([esmCtx.watch(), iifeCtx.watch()]);
  console.log("esbuild watching for changes...");
} else {
  await Promise.all([esbuild.build(esmBuild), esbuild.build(iifeBuild)]);
}
