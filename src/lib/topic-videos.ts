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
    { title: "Most People Don't Know How Bikes Work", channel: "Veritasium", youtubeId: "9cNmUNHSBac" },
  ],
  "physics/phys-motion": [
    { title: "Newton's Laws of Motion", channel: "The Organic Chemistry Tutor", youtubeId: "g550H4e5FCY" },
  ],
  "physics/phys-force": [
    { title: "Newton's Laws of Motion", channel: "The Organic Chemistry Tutor", youtubeId: "g550H4e5FCY" },
    { title: "Most People Don't Know How Bikes Work", channel: "Veritasium", youtubeId: "9cNmUNHSBac" },
  ],
  "physics/phys-energy": [
    { title: "Understanding Bernoulli's Equation", channel: "The Efficient Engineer", youtubeId: "DW4rItB20h4" },
  ],
  "physics/phys-mom": [
    { title: "Newton's Laws of Motion", channel: "The Organic Chemistry Tutor", youtubeId: "g550H4e5FCY" },
  ],
  "physics/phys-heat": [
    { title: "The Most Misunderstood Concept in Physics", channel: "Veritasium", youtubeId: "DxL2HoqLbyA" },
  ],
  "physics/phys-temp": [
    { title: "The Most Misunderstood Concept in Physics", channel: "Veritasium", youtubeId: "DxL2HoqLbyA" },
  ],
  "physics/phys-ent": [
    { title: "The Most Misunderstood Concept in Physics", channel: "Veritasium", youtubeId: "DxL2HoqLbyA" },
  ],
  "physics/phys-elec": [
    { title: "The Biggest Misconception About Electricity", channel: "Veritasium", youtubeId: "bHIhgxav9LY" },
    { title: "How Electricity Actually Works", channel: "Veritasium", youtubeId: "oI_X2cMHNe0" },
  ],
  "physics/phys-circ": [
    { title: "The Biggest Misconception About Electricity", channel: "Veritasium", youtubeId: "bHIhgxav9LY" },
  ],
  "physics/phys-mag": [
    { title: "How Electricity Actually Works", channel: "Veritasium", youtubeId: "oI_X2cMHNe0" },
  ],
  "physics/phys-rel": [
    { title: "Something Strange Happens When You Follow Einstein's Math", channel: "Veritasium", youtubeId: "6akmv1bsz1M" },
  ],
  "physics/phys-qm": [
    { title: "Why Parallel Universes Are Probably Real", channel: "Veritasium", youtubeId: "kTXTPe3wahc" },
  ],
  "physics/phys-fluid": [
    { title: "Understanding Bernoulli's Equation", channel: "The Efficient Engineer", youtubeId: "DW4rItB20h4" },
  ],
  "chemistry/chem-bond": [
    { title: "VSEPR Theory \u2014 Basic Introduction", channel: "The Organic Chemistry Tutor", youtubeId: "DBrq31w8vC4" },
    { title: "Hybridization of Atomic Orbitals", channel: "The Organic Chemistry Tutor", youtubeId: "pdJeQUd2g_4" },
  ],
  "chemistry/chem-carbon": [
    { title: "Organic Chemistry - Basic Introduction", channel: "The Organic Chemistry Tutor", youtubeId: "bSMx0NS0XfY" },
  ],
  "chemistry/chem-stoich": [
    { title: "Stoichiometry Basic Introduction", channel: "The Organic Chemistry Tutor", youtubeId: "6o7X2kFq0e4" },
  ],
  "ecology/eco-food": [
    { title: "How Wolves Change Rivers", channel: "Veritasium", youtubeId: "ysa5OBhXz-Q" },
  ],
  "ecology/eco-chain": [
    { title: "How Wolves Change Rivers", channel: "Veritasium", youtubeId: "ysa5OBhXz-Q" },
  ],
  "ecology/eco-web": [
    { title: "How Wolves Change Rivers", channel: "Veritasium", youtubeId: "ysa5OBhXz-Q" },
  ],
};

/** Fallback when a specific concept has no mapping */
export const FIELD_VIDEOS: Record<string, TopicVideo[]> = {
  physics: [
    { title: "Newton's Laws of Motion", channel: "The Organic Chemistry Tutor", youtubeId: "g550H4e5FCY" },
    { title: "The Biggest Misconception About Electricity", channel: "Veritasium", youtubeId: "bHIhgxav9LY" },
  ],
  chemistry: [
    { title: "Organic Chemistry - Basic Introduction", channel: "The Organic Chemistry Tutor", youtubeId: "bSMx0NS0XfY" },
    { title: "Stoichiometry Basic Introduction", channel: "The Organic Chemistry Tutor", youtubeId: "6o7X2kFq0e4" },
  ],
  quantum: [
    { title: "Why Parallel Universes Are Probably Real", channel: "Veritasium", youtubeId: "kTXTPe3wahc" },
  ],
  materials: [
    { title: "An Introduction to Stress and Strain", channel: "The Efficient Engineer", youtubeId: "aQf6Q8t1FQE" },
  ],
  ecology: [
    { title: "How Wolves Change Rivers", channel: "Veritasium", youtubeId: "ysa5OBhXz-Q" },
  ],
  biology: [
    { title: "How Wolves Change Rivers", channel: "Veritasium", youtubeId: "ysa5OBhXz-Q" },
  ],
  astronomy: [
    { title: "Something Strange Happens When You Follow Einstein's Math", channel: "Veritasium", youtubeId: "6akmv1bsz1M" },
  ],
  geology: [
    { title: "An Introduction to Stress and Strain", channel: "The Efficient Engineer", youtubeId: "aQf6Q8t1FQE" },
  ],
  psychology: [
    { title: "The Surprising Secret of Synchronization", channel: "Veritasium", youtubeId: "t-_VPRCtiUg" },
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
