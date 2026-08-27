import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, rmSync } from "node:fs";
import { assertVersionsMatch } from "./lib/versionCheck.mjs";

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
const manifest = JSON.parse(readFileSync("public/manifest.json", "utf-8"));
const version = assertVersionsMatch(pkg.version, manifest.version);

// esbuild doesn't clean its own output directory — a stale dist/ from a
// previous build (e.g. before popup.html/popup.js were removed) would
// otherwise get zipped up alongside the current build's files.
if (existsSync("dist")) rmSync("dist", { recursive: true });

console.log("Building extension...");
execFileSync("node", ["esbuild.config.mjs"], { stdio: "inherit" });
execFileSync("node", ["scripts/copy-static.mjs"], { stdio: "inherit" });

const zipName = `pariksha-in-chrome-v${version}.zip`;
if (existsSync(zipName)) rmSync(zipName);

console.log(`Zipping dist/ contents into ${zipName} (manifest.json at zip root)...`);
// Run zip with cwd = dist/ (not the repo root) so paths inside the archive
// are relative to dist/ itself — manifest.json, background.js,
// content-script.js, and icons/icon-*.png all land at/under the zip root,
// not nested under a "dist/" wrapper folder.
execFileSync("zip", ["-r", `../${zipName}`, "."], {
  cwd: "dist",
  stdio: "inherit",
});

console.log(`Done: ${zipName}`);
