#!/usr/bin/env node
/**
 * Build src/lib/curriculum/<field>.ts from scripts/concepts/<field>.json
 * so field pages list all topics (not only Ecology).
 *
 * Usage: node scripts/build-curriculum-from-concepts.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONCEPTS = path.join(ROOT, "scripts", "concepts");
const OUT = path.join(ROOT, "src", "lib", "curriculum");

const META = {
  physics: { name: "Physics", tagline: "Matter, energy, space, and time.", overview: "Physics studies the fundamental laws of nature from particles to the cosmos.", searchQuery: "physics review open access", subfields: ["Classical", "Modern", "Applied"] },
  chemistry: { name: "Chemistry", tagline: "Atoms, bonds, and transformations of matter.", overview: "Chemistry studies the composition, structure, and reactions of matter.", searchQuery: "chemistry review open access", subfields: ["General", "Organic", "Physical", "Analytical"] },
  biology: { name: "Biology", tagline: "Life as chemistry with history.", overview: "Biology studies living systems from molecules to ecosystems.", searchQuery: "biology review open access", subfields: ["Cells", "Genetics", "Organisms", "Ecology"] },
  astronomy: { name: "Astronomy", tagline: "Worlds beyond Earth.", overview: "Astronomy studies planets, stars, galaxies, and the universe.", searchQuery: "astronomy review open access", subfields: ["Planetary", "Stellar", "Cosmology"] },
  earth: { name: "Earth Science", tagline: "The planet as a system.", overview: "Earth science studies geology, oceans, atmosphere, and surface processes.", searchQuery: "earth science geology open access", subfields: ["Geology", "Ocean", "Atmosphere"] },
  mathematics: { name: "Mathematics", tagline: "Structure, proof, and quantity.", overview: "Mathematics develops rigorous language for pattern, change, and structure.", searchQuery: "mathematics education open access", subfields: ["Algebra", "Analysis", "Geometry"] },
  computing: { name: "Computer Science", tagline: "Computation and information.", overview: "Computer science studies algorithms, systems, and intelligent behaviour.", searchQuery: "computer science review open access", subfields: ["Algorithms", "Systems", "AI"] },
  medicine: { name: "Medicine", tagline: "Health, disease, and care.", overview: "Medicine applies biological science to prevent, diagnose, and treat disease.", searchQuery: "medical education open access", subfields: ["Systems", "Disease", "Clinical"] },
  neuroscience: { name: "Neuroscience", tagline: "Nervous systems and behaviour.", overview: "Neuroscience studies neurons, circuits, and the biological basis of mind.", searchQuery: "neuroscience review open access", subfields: ["Cells", "Systems", "Cognition"] },
  ecology: { name: "Ecology", tagline: "Organisms, environments, and systems.", overview: "Ecology studies interactions among organisms and their environments.", searchQuery: "ecology review open access", subfields: ["Ecosystems", "Populations", "Conservation"] },
  materials: { name: "Materials Science", tagline: "Structure and properties of matter in use.", overview: "Materials science connects structure, processing, and performance of materials.", searchQuery: "materials science open access", subfields: ["Structure", "Properties", "Applications"] },
  psychology: { name: "Psychology", tagline: "Mind, brain, and behaviour.", overview: "Psychology studies behaviour and mental processes across development and society.", searchQuery: "psychology review open access", subfields: ["Cognitive", "Social", "Clinical"] },
};

function conceptBlock(c) {
  const why = `Core topic in ${c.module}: ${c.title}.`;
  const summary = `${c.title} is a standard topic in ${c.module}. Master definitions, mechanisms, and evidence. Use linked lessons, Oracle, and the open-access library to go deeper at your level.`;
  return `  {
    id: ${JSON.stringify(c.id)},
    module: ${JSON.stringify(c.module)},
    title: ${JSON.stringify(c.title)},
    whyItMatters: ${JSON.stringify(why)},
    minutes: 25,
    keyIdeas: [
      ${JSON.stringify("Definition and scope of " + c.title)},
      "Mechanisms and evidence from established science",
      "Links to neighbouring topics in this module",
    ],
    summary: ${JSON.stringify(summary)},
  }`;
}

if (!fs.existsSync(CONCEPTS)) {
  console.error("Missing scripts/concepts/");
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

const sciencesImports = [];
const sciencesFields = [];

for (const f of fs.readdirSync(CONCEPTS).filter((x) => x.endsWith(".json"))) {
  const slug = f.replace(/\.json$/, "");
  if (slug === "ecology") {
    const ecoMain = path.join(OUT, "ecology.ts");
    if (fs.existsSync(ecoMain)) {
      console.log("keep existing ecology.ts");
      sciencesImports.push(`import ecology from "./curriculum/ecology";`);
      sciencesFields.push("  ecology,");
      continue;
    }
  }
  let concepts;
  try {
    concepts = JSON.parse(fs.readFileSync(path.join(CONCEPTS, f), "utf8"));
  } catch {
    console.warn("skip invalid JSON", f);
    continue;
  }
  if (!Array.isArray(concepts) || !concepts.length) {
    console.warn("skip empty", f);
    continue;
  }
  const meta = META[slug] || {
    name: slug,
    tagline: "Scientific study of " + slug,
    overview: "Topics in " + slug,
    searchQuery: slug + " open access",
    subfields: [...new Set(concepts.map((c) => c.module))],
  };
  const body = `import type { ScienceField } from "../sciences-types";

const field = {
  slug: ${JSON.stringify(slug)},
  name: ${JSON.stringify(meta.name)},
  tagline: ${JSON.stringify(meta.tagline)},
  overview: ${JSON.stringify(meta.overview)},
  searchQuery: ${JSON.stringify(meta.searchQuery)},
  subfields: ${JSON.stringify(meta.subfields)},
  concepts: [
${concepts.map(conceptBlock).join(",\n")}
  ],
  landmarks: [],
} as ScienceField;

export default field;
`;
  const dest = path.join(OUT, slug + ".ts");
  fs.writeFileSync(dest, body, "utf8");
  console.log("wrote", path.relative(ROOT, dest), concepts.length, "concepts");
  sciencesImports.push(`import ${slug} from "./curriculum/${slug}";`);
  sciencesFields.push(`  ${slug},`);
}

const sciences = `import type { Concept, ScienceField } from "./sciences-types";
export type { Concept, FieldSlug, LandmarkPaper, ScienceField } from "./sciences-types";
export { FIELD_SLUGS } from "./sciences-types";

${sciencesImports.join("\n")}

export const FIELDS: ScienceField[] = [
${sciencesFields.join("\n")}
];

export function getField(slug: string): ScienceField | undefined {
  return FIELDS.find((f) => f.slug === slug);
}

export function getConcept(slug: string, conceptId: string) {
  const field = getField(slug);
  if (!field) return undefined;
  const concept = field.concepts.find((c) => c.id === conceptId);
  if (!concept) return undefined;
  return { field, concept };
}

export function allConcepts() {
  return FIELDS.flatMap((f) => f.concepts.map((c) => ({ field: f, concept: c })));
}

export function conceptsByModule(field: ScienceField) {
  const map = new Map<string, Concept[]>();
  for (const c of field.concepts) {
    const list = map.get(c.module) ?? [];
    list.push(c);
    map.set(c.module, list);
  }
  return Array.from(map.entries()).map(([module, concepts]) => ({ module, concepts }));
}
`;
fs.writeFileSync(path.join(ROOT, "src", "lib", "sciences.ts"), sciences, "utf8");
console.log("updated src/lib/sciences.ts");
console.log("Restart Vite, then open /fields/biology etc.");
