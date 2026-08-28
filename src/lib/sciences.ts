import type { Concept, ScienceField } from "./sciences-types";
export type { Concept, FieldSlug, LandmarkPaper, ScienceField } from "./sciences-types";
export { FIELD_SLUGS } from "./sciences-types";

import physics from "./curriculum/physics";
import chemistry from "./curriculum/chemistry";
import biology from "./curriculum/biology";
import astronomy from "./curriculum/astronomy";
import earth from "./curriculum/earth";
import mathematics from "./curriculum/mathematics";
import computing from "./curriculum/computing";
import medicine from "./curriculum/medicine";
import neuroscience from "./curriculum/neuroscience";
import ecology from "./curriculum/ecology";
import materials from "./curriculum/materials";
import psychology from "./curriculum/psychology";

export const FIELDS: ScienceField[] = [
  physics,
  chemistry,
  biology,
  astronomy,
  earth,
  mathematics,
  computing,
  medicine,
  neuroscience,
  ecology,
  materials,
  psychology,
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
