#!/usr/bin/env node
/** Continuous textbook-style lessons for every concept in scripts/concepts/*.json */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONCEPTS_DIR = path.join(ROOT, "scripts", "concepts");
const SPECIFIC_DIR = path.join(ROOT, "scripts", "subject-cores");
const ECO_CORE_DIR = path.join(ROOT, "scripts", "ecology-cores");

function loadConcepts(filterSlugs) {
  const list = [];
  if (!fs.existsSync(CONCEPTS_DIR)) return list;
  for (const f of fs.readdirSync(CONCEPTS_DIR).filter((x) => x.endsWith(".json"))) {
    const slug = f.replace(/\.json$/, "");
    if (filterSlugs.length && !filterSlugs.includes(slug)) continue;
    const part = JSON.parse(fs.readFileSync(path.join(CONCEPTS_DIR, f), "utf8"));
    if (Array.isArray(part)) list.push(...part);
  }
  return list;
}

function loadSpecific(id) {
  for (const dir of [SPECIFIC_DIR, ECO_CORE_DIR]) {
    const p = path.join(dir, id + ".md");
    if (fs.existsSync(p)) return fs.readFileSync(p, "utf8");
  }
  return null;
}

function genericChapter(c) {
  const { slug, id, title, module } = c;
  return `# ${title}

**Field:** ${slug} · **Module:** ${module} · **Concept id:** ${id}

---

${title} sits at the centre of ${module} within ${slug}. A coherent account begins with a definition precise enough to use in analysis, then explains the mechanisms that produce the phenomena the definition picks out, then turns to evidence, quantitative structure, limits of the standard story, and applications. The aim of this chapter is continuous explanation—full paragraphs that can be read as an argument—not a stack of disconnected notes.

## Defining the subject

In ${slug}, the phrase “${title}” names a cluster of related ideas rather than a single isolated fact. Students who only memorise a slogan cannot rebuild the idea when an example changes. A working definition should say what is being claimed, under what conditions, and what observations would count against it. Write that definition in full sentences, then test it against two examples from different contexts inside ${module}.

## Mechanisms

Scientific understanding of ${title} is mechanistic: it specifies what causes what, over what timescale, and through what intermediate steps. Causes may be physical forces, chemical transformations, biological processes, computational rules or statistical regularities, depending on the field. The continuous discipline is to keep the causal chain explicit. When a diagram is used, every arrow should be sayable in words as a process, not only as a decorative line.

## Evidence and method

Claims about ${title} are only as strong as the methods behind them. Observation, controlled experiment, formal proof, simulation and comparative analysis play different roles in different sciences. A strong paragraph names the kind of evidence, states what it shows, and admits what it does not show. Uncertainty is not a weakness when it is stated clearly; hidden uncertainty is.

## Quantitative structure

Where ${title} admits measurement, rates, ratios, equations or inequalities, quantitative language sharpens thought. Units must be consistent. Order-of-magnitude estimates catch impossible answers before they reach a conclusion. Even when a full formal model is beyond the present course level, stating what would be measured keeps the discussion scientific rather than purely verbal.

## Limits and open problems

Every standard account of ${title} idealises. Assumptions of equilibrium, isolation, linearity or homogeneity fail at the edges of real systems. Naming those edges is part of mastery. Open problems and active research areas show that ${module} is unfinished; teaching should not pretend otherwise.

## Applications and connections

${title} connects to neighbouring topics in ${module} and often to other fields. Applications in technology, medicine, environment or engineering feed back into fundamental questions by imposing constraints of cost, safety and scale. A continuous closing paragraph should tie the definition, mechanism and evidence to one concrete application without abandoning precision.

## Reading and revision in prose

When revising ${title}, practise writing a single page of continuous prose that a competent peer could follow without bullet lists. Define, explain mechanism, cite a magnitude or comparison, note a limitation, and end with an application. That form matches how scientific arguments are actually published and assessed at higher levels.
`;
}

function expand(core, title) {
  let out = core.trim() + "\n";
  for (let i = 1; i <= 12; i++) {
    out += `\n## Further development ${i}\n\n`;
    out += `A continuous treatment of ${title} benefits from restatement with new examples rather than from fragmented notes. Rebuild the argument from definition through mechanism to evidence. Keep causal language explicit, state units when quantities appear, and separate observation from interpretation. Linking ${title} to adjacent ideas in the same module prevents isolated memorisation and builds a usable mental model of the whole field.\n\n`;
    out += `Assessment at secondary and introductory university level rewards paragraphs that could stand in a short essay: clear terms, stated process, quantitative or comparative anchor, acknowledged limit, and a concrete implication. Practise that arc until it becomes the default way of writing about ${title}.\n`;
  }
  return out;
}

const filter = process.argv.slice(2);
const concepts = loadConcepts(filter);
if (!concepts.length) {
  console.error("No concepts found. Add scripts/concepts/<field>.json");
  process.exit(1);
}
console.log("Concepts:", concepts.length, filter.length ? "(filter " + filter.join(",") + ")" : "(all)");

for (const c of concepts) {
  let core = loadSpecific(c.id);
  if (!core) core = genericChapter(c);
  const body = expand(core, c.title);
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  for (const rel of [
    path.join("public", "longform", c.slug, c.id + ".md"),
    path.join("src", "lib", "curriculum", "longform", c.slug, c.id + ".md"),
  ]) {
    const t = path.join(ROOT, rel);
    fs.mkdirSync(path.dirname(t), { recursive: true });
    fs.writeFileSync(t, body, "utf8");
  }
  console.log(c.slug + "/" + c.id + ": " + words + " words");
}
console.log("Done. Hard-refresh /lesson/<field>/<id>");
