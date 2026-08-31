import type { ScienceField } from "../sciences-types";
import { ecologyConceptsA } from "./ecology-a";
import { ecologyConceptsB } from "./ecology-b";

const field = {
  slug: "ecology",
  name: "Ecology",
  tagline: "Organisms, environments, and systems they form.",
  overview:
    "Ecology studies interactions among organisms and their environments. Energy flow, nutrient cycles, populations, communities, conservation, and climate links form the examinable core. Each lesson is written for secondary and first-year university depth: definitions, mechanisms, graphs, worked reasoning, and common pitfalls.",
  searchQuery: "ecology energy flow nutrient cycles population dynamics open access",
  subfields: ["Ecosystems", "Populations", "Communities", "Conservation", "Climate", "Applied"],
  concepts: [...ecologyConceptsA, ...ecologyConceptsB],
  landmarks: [
    {
      title: "Concluding remarks (niche concept)",
      authors: "G. E. Hutchinson",
      year: 1957,
      significance: "Formalised the niche as an n-dimensional hypervolume; still structures ecological thought.",
    },
    {
      title: "The strategy of ecosystem development",
      authors: "E. P. Odum",
      year: 1969,
      significance: "Classic synthesis of succession, energy flow, and ecosystem development trends.",
    },
  ],
} as ScienceField;

export default field;
