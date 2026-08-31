import type { ScienceField } from "../sciences-types";
import { ecologyConceptsA } from "./ecology-a";
import { ecologyConceptsB } from "./ecology-b";

const field = {
  slug: "ecology",
  name: "Ecology",
  tagline: "Organisms, environments, and systems they form.",
  overview:
    "Ecology studies interactions among organisms and their environments. Energy flow, nutrient cycles, populations, communities, conservation, and climate links form the examinable core. Lessons are written for secondary and first-year university depth.",
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
  ],
} as ScienceField;

export default field;
