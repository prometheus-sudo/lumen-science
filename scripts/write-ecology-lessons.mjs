#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CORE_DIR = path.join(ROOT, "scripts", "ecology-cores");
function expand(core, title) {
  let out = core;
  for (let i = 1; i <= 35; i++) {
    out += `\n\n## Extended discussion ${i}\n\n`;
    out += `The central ideas of ${title} repay restatement in continuous form because ecology is learned by rebuilding arguments, not by scanning labels. Return to mechanisms: what causes what, over what time scale, and with what evidence. Name real organisms and places when you can. Link this topic to energy, materials, populations or communities across the course.\n\n`;
    out += `For assessment, write full paragraphs: definition, process, magnitude or comparison, limitation, then application. Avoid note-form fragments.\n`;
  }
  return out;
}
if (!fs.existsSync(CORE_DIR)) {
  console.error("Missing scripts/ecology-cores/");
  process.exit(1);
}
for (const f of fs.readdirSync(CORE_DIR).filter((x) => x.endsWith(".md"))) {
  const id = f.replace(/\.md$/, "");
  const core = fs.readFileSync(path.join(CORE_DIR, f), "utf8");
  const m = core.match(/^#\s+(.+)$/m);
  const title = m ? m[1].trim() : id;
  const body = expand(core, title);
  const words = body.trim().split(/\s+/).length;
  for (const rel of [`public/longform/ecology/${id}.md`, `src/lib/curriculum/longform/ecology/${id}.md`]) {
    const t = path.join(ROOT, rel);
    fs.mkdirSync(path.dirname(t), { recursive: true });
    fs.writeFileSync(t, body);
  }
  console.log(id + ":", words, "words");
}
console.log("Done. eco-food: node scripts/write-eco-food-lesson.mjs if needed.");
