export const FIELD_SLUGS = [
  "physics",
  "chemistry",
  "biology",
  "astronomy",
  "earth",
  "mathematics",
  "computing",
  "medicine",
  "neuroscience",
  "ecology",
  "materials",
  "psychology",
  "quantum",
] as const;

export type FieldSlug = (typeof FIELD_SLUGS)[number];

export type Concept = {
  id: string;
  module: string;
  title: string;
  whyItMatters: string;
  summary: string;
  keyIdeas: string[];
  objectives?: string[];
  terms?: { term: string; definition: string }[];
  checkQuestions?: string[];
  pitfalls?: string[];
  minutes?: number;
};

export type LandmarkPaper = {
  title: string;
  authors: string;
  year: number;
  doi?: string;
  significance: string;
};

export type ScienceField = {
  slug: FieldSlug;
  name: string;
  tagline: string;
  overview: string;
  searchQuery: string;
  subfields: string[];
  concepts: Concept[];
  landmarks: LandmarkPaper[];
};
