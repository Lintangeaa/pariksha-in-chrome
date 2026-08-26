import { cpSync, mkdirSync } from "node:fs";

mkdirSync("dist", { recursive: true });
cpSync("public/manifest.json", "dist/manifest.json");
cpSync("public/popup.html", "dist/popup.html");
