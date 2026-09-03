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
  "physics/phys-mech": [
    { title: "Most People Don't Know How Bikes Work", channel: "Veritasium", youtubeId: "9cNmUNHSBac", note: "Forces and everyday mechanics." },
  ],
  "physics/phys-motion": [
    { title: "Newton's Laws of Motion", channel: "The Organic Chemistry Tutor", youtubeId: "g550H4e5FCY", note: "Kinematics and Newton's laws." },
  ],
  "physics/phys-force": [
    { title: "Newton's Laws of Motion", channel: "The Organic Chemistry Tutor", youtubeId: "g550H4e5FCY", note: "Force and acceleration." },
    { title: "Most People Don't Know How Bikes Work", channel: "Veritasium", youtubeId: "9cNmUNHSBac", note: "Forces in everyday systems." },
  ],
  "physics/phys-energy": [
    { title: "Understanding Bernoulli's Equation", channel: "The Efficient Engineer", youtubeId: "DW4rItB20h4", note: "Energy in fluids." },
  ],
  "physics/phys-mom": [
    { title: "Newton's Laws of Motion", channel: "The Organic Chemistry Tutor", youtubeId: "g550H4e5FCY", note: "Momentum foundations." },
  ],
  "physics/phys-heat": [
    { title: "The Most Misunderstood Concept in Physics", channel: "Veritasium", youtubeId: "DxL2HoqLbyA", note: "Entropy and the arrow of time." },
  ],
  "physics/phys-temp": [
    { title: "The Most Misunderstood Concept in Physics", channel: "Veritasium", youtubeId: "DxL2HoqLbyA", note: "Temperature and thermodynamics." },
  ],
  "physics/phys-ent": [
    { title: "The Most Misunderstood Concept in Physics", channel: "Veritasium", youtubeId: "DxL2HoqLbyA", note: "Entropy." },
  ],
  "physics/phys-elec": [
    { title: "The Biggest Misconception About Electricity", channel: "Veritasium", youtubeId: "bHIhgxav9LY", note: "How energy moves in circuits." },
    { title: "How Electricity Actually Works", channel: "Veritasium", youtubeId: "oI_X2cMHNe0", note: "Fields and electrical energy." },
  ],
  "physics/phys-circ": [
    { title: "The Biggest Misconception About Electricity", channel: "Veritasium", youtubeId: "bHIhgxav9LY", note: "Circuit energy flow." },
  ],
  "physics/phys-mag": [
    { title: "How Electricity Actually Works", channel: "Veritasium", youtubeId: "oI_X2cMHNe0", note: "Fields related to magnetism." },
  ],
  "physics/phys-rel": [
    { title: "Something Strange Happens When You Follow Einstein's Math", channel: "Veritasium", youtubeId: "6akmv1bsz1M", note: "Relativity." },
  ],
  "physics/phys-qm": [
    { title: "Why Parallel Universes Are Probably Real", channel: "Veritasium", youtubeId: "kTXTPe3wahc", note: "Quantum measurement ideas." },
  ],
  "physics/phys-fluid": [
    { title: "Understanding Bernoulli's Equation", channel: "The Efficient Engineer", youtubeId: "DW4rItB20h4", note: "Fluid energy." },
  ],
  "chemistry/chem-bond": [
    { title: "VSEPR Theory \u2014 Basic Introduction", channel: "The Organic Chemistry Tutor", youtubeId: "DBrq31w8vC4", note: "Molecular shape." },
    { title: "Hybridization of Atomic Orbitals (sp, sp2, sp3)", channel: "The Organic Chemistry Tutor", youtubeId: "pdJeQUd2g_4", note: "Bonding orbitals." },
  ],
  "chemistry/chem-carbon": [
    { title: "Organic Chemistry - Basic Introduction", channel: "The Organic Chemistry Tutor", youtubeId: "bSMx0NS0XfY", note: "Carbon chemistry." },
  ],
  "chemistry/chem-stoich": [
    { title: "Stoichiometry Basic Introduction", channel: "The Organic Chemistry Tutor", youtubeId: "6o7X2kFq0e4", note: "Mole ratios." },
  ],
  "chemistry/chem-fg": [
    { title: "Organic Chemistry - Basic Introduction", channel: "The Organic Chemistry Tutor", youtubeId: "bSMx0NS0XfY", note: "Functional groups context." },
  ],
  "chemistry/chem-hc": [
    { title: "Organic Chemistry - Basic Introduction", channel: "The Organic Chemistry Tutor", youtubeId: "bSMx0NS0XfY", note: "Hydrocarbons." },
  ],
  "quantum/quan-intro": [
    { title: "Why Parallel Universes Are Probably Real", channel: "Veritasium", youtubeId: "kTXTPe3wahc", note: "Quantum ideas." },
  ],
  "quantum/quan-wave": [
    { title: "Wave-Particle Duality Explained", channel: "The Organic Chemistry Tutor", youtubeId: "Swx4I_j6e-g", note: "Dual nature." },
  ],
  "quantum/quan-photo": [
    { title: "The Photoelectric Effect", channel: "The Organic Chemistry Tutor", youtubeId: "kzL-ZjG1A2s", note: "Photons and electrons." },
  ],
  "quantum/quan-uncert": [
    { title: "Heisenberg's Uncertainty Principle", channel: "Veritasium", youtubeId: "a8FvgUvQ0bY", note: "Uncertainty." },
  ],
  "quantum/quan-entangle": [
    { title: "Quantum Entanglement & Spooky Action", channel: "Veritasium", youtubeId: "ZuvK-oq9K0s", note: "Entanglement." },
  ],
  "materials/mat-strength": [
    { title: "Understanding Material Strength, Ductility and Toughness", channel: "The Efficient Engineer", youtubeId: "WSRqJdT2COE", note: "Structure\u2013property." },
  ],
  "materials/mat-stress": [
    { title: "An Introduction to Stress and Strain", channel: "The Efficient Engineer", youtubeId: "aQf6Q8t1FQE", note: "Load and deformation." },
  ],
  "ecology/eco-food": [
    { title: "World's Largest Population Pyramid", channel: "Veritasium", youtubeId: "RLmKfXwWQtE", note: "Population and systems." },
  ],
  "psychology/psy-bias": [
    { title: "The Most Common Cognitive Bias", channel: "Veritasium", youtubeId: "vKA4w2O61Xo", note: "Cognitive bias." },
  ],
};

export const FIELD_VIDEOS: Record<string, TopicVideo[]> = {
  physics: [
    { title: "Newton's Laws of Motion", channel: "The Organic Chemistry Tutor", youtubeId: "g550H4e5FCY", note: "Core classical mechanics." },
    { title: "The Biggest Misconception About Electricity", channel: "Veritasium", youtubeId: "bHIhgxav9LY", note: "Electric energy." },
  ],
  chemistry: [
    { title: "Organic Chemistry - Basic Introduction", channel: "The Organic Chemistry Tutor", youtubeId: "bSMx0NS0XfY", note: "Carbon chemistry overview." },
  ],
  quantum: [
    { title: "Why Parallel Universes Are Probably Real", channel: "Veritasium", youtubeId: "kTXTPe3wahc", note: "Quantum overview." },
  ],
  materials: [
    { title: "An Introduction to Stress and Strain", channel: "The Efficient Engineer", youtubeId: "aQf6Q8t1FQE", note: "Materials basics." },
  ],
  ecology: [
    { title: "World's Largest Population Pyramid", channel: "Veritasium", youtubeId: "RLmKfXwWQtE", note: "Systems thinking." },
  ],
};

export function videosForConcept(fieldSlug: string, conceptId: string): TopicVideo[] {
  const key = `${fieldSlug}/${conceptId}`;
  const exact = TOPIC_VIDEOS[key];
  if (exact?.length) return exact;
  const hits: TopicVideo[] = [];
  for (const [k, vids] of Object.entries(TOPIC_VIDEOS)) {
    if (!k.startsWith(fieldSlug + "/")) continue;
    const cid = k.slice(fieldSlug.length + 1);
    if (conceptId.includes(cid) || cid.includes(conceptId)) hits.push(...vids);
  }
  if (hits.length) {
    const seen = new Set<string>();
    return hits.filter((v) => {
      if (seen.has(v.youtubeId)) return false;
      seen.add(v.youtubeId);
      return true;
    });
  }
  return FIELD_VIDEOS[fieldSlug] ?? [];
}
