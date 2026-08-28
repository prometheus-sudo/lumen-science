import type { Concept, ScienceField } from "./sciences-types";
export type { Concept, FieldSlug, LandmarkPaper, ScienceField } from "./sciences-types";
export { FIELD_SLUGS } from "./sciences-types";

import ecology from "./curriculum/ecology";

/** Temporary stub until full module files are published */
function stub(
  slug: ScienceField["slug"],
  name: string,
  tagline: string,
): ScienceField {
  return {
    slug,
    name,
    tagline,
    overview: `${name} curriculum is loading. Pull the latest lumen-science curriculum modules to unlock full lessons.`,
    searchQuery: `${name} review open access`,
    subfields: [],
    concepts: [],
    landmarks: [],
  };
}

export const FIELDS: ScienceField[] = [
  stub("physics", "Physics", "Matter, energy, space, and time."),
  stub("chemistry", "Chemistry", "Atoms, bonds, and transformations of matter."),
  stub("biology", "Biology", "Life as chemistry with history."),
  stub("astronomy", "Astronomy", "Planets, stars, galaxies, and the universe."),
  stub("earth", "Earth science", "Rock, water, air, and life as one system."),
  stub("mathematics", "Mathematics", "Structure, proof, and quantity."),
  stub("computing", "Computer science", "Information, algorithms, and systems."),
  stub("medicine", "Medicine", "Health, disease, and care."),
  stub("neuroscience", "Neuroscience", "Nervous systems from cells to mind."),
  ecology,
  stub("materials", "Materials science", "Structure, properties, and processing."),
  stub("psychology", "Psychology", "Mind, brain, and behavior."),
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
  return FIELDS.flatMap((f) =>
    f.concepts.map((c) => ({ field: f, concept: c })),
  );
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
