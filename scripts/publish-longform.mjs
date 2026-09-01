#!/usr/bin/env node
/** Copy src/lib/curriculum/longform -> public/longform so the browser can fetch lessons. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src", "lib", "curriculum", "longform");
const DEST = path.join(ROOT, "public", "longform");

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const name of fs.readdirSync(from)) {
    const a = path.join(from, name);
    const b = path.join(to, name);
    if (fs.statSync(a).isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}

if (!fs.existsSync(SRC)) {
  console.error("No longform at", SRC);
  console.error("Run: node scripts/generate-longform.mjs");
  process.exit(1);
}
copyDir(SRC, DEST);
const sample = path.join(DEST, "ecology", "eco-food.md");
console.log("Published to", DEST);
console.log("Sample exists:", fs.existsSync(sample), sample);
if (fs.existsSync(sample)) {
  console.log("Sample bytes:", fs.statSync(sample).size);
}
console.log("Open: http://localhost:8080/longform/ecology/eco-food.md");
console.log("Then: http://localhost:8080/lesson/ecology/eco-food");
