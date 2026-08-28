/**
 * Curated open educational videos mapped to Lumen concepts.
 * Sources: Veritasium, The Efficient Engineer, The Organic Chemistry Tutor.
 * Links only — we do not host or re-upload third-party video.
 */

export type TopicVideo = {
  title: string;
  channel: "Veritasium" | "The Efficient Engineer" | "The Organic Chemistry Tutor";
  youtubeId: string;
  /** Optional short note for the learner */
  note?: string;
};

export function youtubeWatchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function youtubeEmbedUrl(id: string) {
  return `https://www.youtube.com/embed/${id}`;
}

/** Keyed by `${fieldSlug}/${conceptId}` */
export const TOPIC_VIDEOS: Record<string, TopicVideo[]> = {
  // —— Physics ——
  "physics/mechanics": [
    {
      title: "Most People Don't Know How Bikes Work",
      channel: "Veritasium",
      youtubeId: "9cNmUNHSBac",
      note: "Stability, forces, and why classical mechanics still surprises us.",
    },
    {
      title: "Newton's Laws of Motion",
      channel: "The Organic Chemistry Tutor",
      youtubeId: "g550H4e5FCY",
      note: "Worked introduction to the three laws with problem setup.",
    },
    {
      title: "Understanding Bernoulli's Equation",
      channel: "The Efficient Engineer",
      youtubeId: "DW4rItB20h4",
      note: "Fluid form of energy conservation used across engineering.",
    },
  ],
  "physics/fields": [
    {
      title: "The Biggest Misconception About Electricity",
      channel: "Veritasium",
      youtubeId: "bHIhgxav9LY",
      note: "How energy actually moves in circuits — fields, not just electrons in a wire.",
    },
    {
      title: "How Electricity Actually Works",
      channel: "Veritasium",
      youtubeId: "oI_X2cMHNe0",
      note: "Follow-up experiment and field picture of electrical energy.",
    },
  ],
  "physics/thermo": [
    {
      title: "The Most Misunderstood Concept in Physics",
      channel: "Veritasium",
      youtubeId: "DxL2HoqLbyA",
      note: "Entropy, usable energy, and the arrow of time.",
    },
  ],
  "physics/quantum": [
    {
      title: "Why Parallel Universes Are Probably Real",
      channel: "Veritasium",
      youtubeId: "kTXTPe3wahc",
      note: "Many-worlds and what quantum measurement forces us to confront.",
    },
  ],

  // —— Chemistry ——
  "chemistry/bonding": [
    {
      title: "VSEPR Theory — Basic Introduction",
      channel: "The Organic Chemistry Tutor",
      youtubeId: "DBrq31w8vC4",
      note: "Shape from electron pairs around a central atom.",
    },
    {
      title: "Hybridization of Atomic Orbitals (sp, sp2, sp3)",
      channel: "The Organic Chemistry Tutor",
      youtubeId: "pdJeQUd2g_4",
      note: "Sigma and pi bonds from hybrid orbitals.",
    },
  ],
  "chemistry/organic": [
    {
      title: "Organic Chemistry — Basic Introduction",
      channel: "The Organic Chemistry Tutor",
      youtubeId: "B_ketdzJtY8",
      note: "Functional groups, carbon frameworks, and how the subject is organized.",
    },
  ],
  "chemistry/energetics": [
    {
      title: "Why It Was Almost Impossible to Make the Blue LED",
      channel: "Veritasium",
      youtubeId: "AF8d72mA41M",
      note: "Band gaps, materials, and why energetics of light emission matter in practice.",
    },
  ],

  // —— Biology ——
  "biology/evolution": [
    {
      title: "The Longest-Running Evolution Experiment",
      channel: "Veritasium",
      youtubeId: "w4sLAQvEH-M",
      note: "Lenski's E. coli experiment and evolution under the microscope.",
    },
  ],

  // —— Astronomy ——
  "astronomy/cosmo": [
    {
      title: "Something Strange Happens When You Follow Einstein's Math",
      channel: "Veritasium",
      youtubeId: "6akmv1bsz1M",
      note: "Black holes and what general relativity forces into existence.",
    },
  ],
  "astronomy/stars": [
    {
      title: "First Image of a Black Hole!",
      channel: "Veritasium",
      youtubeId: "S_GVbuddri8",
      note: "How the Event Horizon Telescope captured M87*.",
    },
  ],
  "astronomy/mechanics-sky": [
    {
      title: "How Dangerous is a Penny Dropped From a Skyscraper?",
      channel: "Veritasium",
      youtubeId: "16Ci_2bN_zc",
      note: "Terminal velocity and forces in everyday gravity problems.",
    },
  ],

  // —— Mathematics ——
  "mathematics/proof": [
    {
      title: "Math's Fundamental Flaw",
      channel: "Veritasium",
      youtubeId: "HeQX2HjkcNo",
      note: "Gödel, incompleteness, and what proof can and cannot settle.",
    },
  ],
  "mathematics/calculus": [
    {
      title: "Calculus 1 Review — Basic Introduction",
      channel: "The Organic Chemistry Tutor",
      youtubeId: "GiCojsAWRj0",
      note: "Limits, derivatives, and the core language of change.",
    },
  ],
  "mathematics/probability": [
    {
      title: "The Surprising Secret of Synchronization",
      channel: "Veritasium",
      youtubeId: "t-_VPRCtiUg",
      note: "Order from coupled systems — bridges probability and dynamics.",
    },
  ],

  // —— Materials ——
  "materials/crystal": [
    {
      title: "Understanding Metals",
      channel: "The Efficient Engineer",
      youtubeId: "PaGJwOPg2kU",
      note: "Crystal structure, defects, work hardening, and alloys.",
    },
    {
      title: "An Introduction to Stress and Strain",
      channel: "The Efficient Engineer",
      youtubeId: "aQf6Q8t1FQE",
      note: "How solids respond to load — the starting point of mechanics of materials.",
    },
  ],
  "materials/phase": [
    {
      title: "Understanding Material Strength, Ductility and Toughness",
      channel: "The Efficient Engineer",
      youtubeId: "WSRqJdT2COE",
      note: "Properties that depend on microstructure and processing.",
    },
    {
      title: "Understanding Young's Modulus",
      channel: "The Efficient Engineer",
      youtubeId: "DLE-ieOVFjI",
      note: "Stiffness as a material property.",
    },
  ],
  "materials/semi": [
    {
      title: "Why It Was Almost Impossible to Make the Blue LED",
      channel: "Veritasium",
      youtubeId: "AF8d72mA41M",
      note: "Semiconductors, band gaps, and materials engineering.",
    },
  ],

  // —— Psychology ——
  "psychology/cognition": [
    {
      title: "The Most Common Cognitive Bias",
      channel: "Veritasium",
      youtubeId: "vKA4w2O61Xo",
      note: "Survivorship and selection biases that warp judgment.",
    },
  ],
};

export function videosForConcept(fieldSlug: string, conceptId: string): TopicVideo[] {
  return TOPIC_VIDEOS[`${fieldSlug}/${conceptId}`] ?? [];
}
