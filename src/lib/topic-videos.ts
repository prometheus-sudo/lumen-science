/**
 * Curated open educational videos mapped to Lumen concepts.
 * Sources: Veritasium, The Efficient Engineer, The Organic Chemistry Tutor.
 */
export type TopicVideo = {
  title: string;
  channel: "Veritasium" | "The Efficient Engineer" | "The Organic Chemistry Tutor";
  youtubeId: string;
  note?: string;
};

export function youtubeWatchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function youtubeEmbedUrl(id: string) {
  return `https://www.youtube.com/embed/${id}`;
}

export const TOPIC_VIDEOS: Record<string, TopicVideo[]> = {
  "physics/newton-laws": [
    { title: "Most People Don't Know How Bikes Work", channel: "Veritasium", youtubeId: "9cNmUNHSBac", note: "Forces and everyday mechanics." },
    { title: "Newton's Laws of Motion", channel: "The Organic Chemistry Tutor", youtubeId: "g550H4e5FCY", note: "Worked introduction to the three laws." },
  ],
  "physics/energy-momentum": [
    { title: "Newton's Laws of Motion", channel: "The Organic Chemistry Tutor", youtubeId: "g550H4e5FCY", note: "Foundation for energy and force problems." },
    { title: "Understanding Bernoulli's Equation", channel: "The Efficient Engineer", youtubeId: "DW4rItB20h4", note: "Energy conservation in fluids." },
  ],
  "physics/fields": [
    { title: "The Biggest Misconception About Electricity", channel: "Veritasium", youtubeId: "bHIhgxav9LY", note: "Fields carry energy in circuits." },
    { title: "How Electricity Actually Works", channel: "Veritasium", youtubeId: "oI_X2cMHNe0", note: "Follow-up field picture of electrical energy." },
  ],
  "physics/circuits": [
    { title: "The Biggest Misconception About Electricity", channel: "Veritasium", youtubeId: "bHIhgxav9LY", note: "How energy moves in circuits." },
  ],
  "physics/thermo": [
    { title: "The Most Misunderstood Concept in Physics", channel: "Veritasium", youtubeId: "DxL2HoqLbyA", note: "Entropy and the arrow of time." },
  ],
  "physics/quantum": [
    { title: "Why Parallel Universes Are Probably Real", channel: "Veritasium", youtubeId: "kTXTPe3wahc", note: "Measurement and many-worlds ideas." },
  ],
  "physics/relativity": [
    { title: "Something Strange Happens When You Follow Einstein's Math", channel: "Veritasium", youtubeId: "6akmv1bsz1M", note: "Relativity toward black holes." },
  ],
  "physics/waves": [
    { title: "The Surprising Secret of Synchronization", channel: "Veritasium", youtubeId: "t-_VPRCtiUg", note: "Coupled oscillators." },
  ],
  "chemistry/bonding": [
    { title: "VSEPR Theory — Basic Introduction", channel: "The Organic Chemistry Tutor", youtubeId: "DBrq31w8vC4", note: "Molecular shape from electron pairs." },
    { title: "Hybridization of Atomic Orbitals (sp, sp2, sp3)", channel: "The Organic Chemistry Tutor", youtubeId: "pdJeQUd2g_4", note: "Sigma and pi bonds." },
  ],
  "chemistry/organic": [
    { title: "Organic Chemistry — Basic Introduction", channel: "The Organic Chemistry Tutor", youtubeId: "B_ketdzJtY8", note: "Functional groups and carbon frameworks." },
  ],
  "chemistry/organic-reactions": [
    { title: "Organic Chemistry — Basic Introduction", channel: "The Organic Chemistry Tutor", youtubeId: "B_ketdzJtY8", note: "Framework for reaction patterns." },
  ],
  "chemistry/energetics": [
    { title: "Why It Was Almost Impossible to Make the Blue LED", channel: "Veritasium", youtubeId: "AF8d72mA41M", note: "Band gaps and energetics of light." },
  ],
  "biology/evolution": [
    { title: "The Longest-Running Evolution Experiment", channel: "Veritasium", youtubeId: "w4sLAQvEH-M", note: "Lenski E. coli experiment." },
  ],
  "astronomy/cosmo": [
    { title: "Something Strange Happens When You Follow Einstein's Math", channel: "Veritasium", youtubeId: "6akmv1bsz1M", note: "Gravity and extreme objects." },
  ],
  "astronomy/stars": [
    { title: "First Image of a Black Hole!", channel: "Veritasium", youtubeId: "S_GVbuddri8", note: "Event Horizon Telescope." },
  ],
  "mathematics/proof": [
    { title: "Math's Fundamental Flaw", channel: "Veritasium", youtubeId: "HeQX2HjkcNo", note: "Gödel and limits of proof." },
  ],
  "mathematics/calculus": [
    { title: "Calculus 1 Review — Basic Introduction", channel: "The Organic Chemistry Tutor", youtubeId: "GiCojsAWRj0", note: "Limits and derivatives." },
  ],
  "materials/crystal": [
    { title: "Understanding Metals", channel: "The Efficient Engineer", youtubeId: "PaGJwOPg2kU", note: "Crystal structure and defects." },
    { title: "An Introduction to Stress and Strain", channel: "The Efficient Engineer", youtubeId: "aQf6Q8t1FQE", note: "Load and deformation." },
  ],
  "materials/phase": [
    { title: "Understanding Material Strength, Ductility and Toughness", channel: "The Efficient Engineer", youtubeId: "WSRqJdT2COE", note: "Structure–property links." },
    { title: "Understanding Young's Modulus", channel: "The Efficient Engineer", youtubeId: "DLE-ieOVFjI", note: "Stiffness." },
  ],
  "materials/semi": [
    { title: "Why It Was Almost Impossible to Make the Blue LED", channel: "Veritasium", youtubeId: "AF8d72mA41M", note: "Semiconductors and band gaps." },
  ],
  "materials/mechanics-mat": [
    { title: "An Introduction to Stress and Strain", channel: "The Efficient Engineer", youtubeId: "aQf6Q8t1FQE", note: "Core mechanical quantities." },
  ],
  "materials/metals": [
    { title: "Understanding Metals", channel: "The Efficient Engineer", youtubeId: "PaGJwOPg2kU", note: "Alloys and microstructure." },
  ],
  "psychology/cognition": [
    { title: "The Most Common Cognitive Bias", channel: "Veritasium", youtubeId: "vKA4w2O61Xo", note: "Selection and survivorship biases." },
  ],
};

export function videosForConcept(fieldSlug: string, conceptId: string): TopicVideo[] {
  return TOPIC_VIDEOS[`${fieldSlug}/${conceptId}`] ?? [];
}
