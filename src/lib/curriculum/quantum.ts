import type { ScienceField } from "../sciences-types";

const field = {
  slug: "quantum",
  name: "Quantum Physics",
  tagline: "Nature at the scale of quanta, waves, and probability.",
  overview:
    "Quantum Physics describes matter and light when classical trajectories fail: discrete energy, wave-particle duality, superposition, entanglement, and technologies from lasers to Quantum information.",
  searchQuery: "quantum mechanics review open access",
  subfields: ["Foundations", "Atoms", "Core principles", "Formalism", "Applications", "Quantum information"],
  concepts: [
    {
      id: "quan-intro",
      module: "Foundations",
      title: "What is Quantum Physics",
      whyItMatters: "Core topic in Quantum Physics: What is Quantum Physics.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of What is Quantum Physics",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Foundations",
      ],
      summary:
        "What is Quantum Physics is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-wave",
      module: "Foundations",
      title: "Wave-particle duality",
      whyItMatters: "Core topic in Quantum Physics: Wave-particle duality.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Wave-particle duality",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Foundations",
      ],
      summary:
        "Wave-particle duality is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-planck",
      module: "Foundations",
      title: "Planck's constant and quanta",
      whyItMatters: "Core topic in Quantum Physics: Planck's constant and quanta.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Planck's constant and quanta",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Foundations",
      ],
      summary:
        "Planck's constant and quanta is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-photo",
      module: "Foundations",
      title: "Photoelectric effect",
      whyItMatters: "Core topic in Quantum Physics: Photoelectric effect.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Photoelectric effect",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Foundations",
      ],
      summary:
        "Photoelectric effect is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-bohr",
      module: "Atoms",
      title: "Bohr model and its limits",
      whyItMatters: "Core topic in Quantum Physics: Bohr model and its limits.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Bohr model and its limits",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Atoms",
      ],
      summary:
        "Bohr model and its limits is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-levels",
      module: "Atoms",
      title: "Energy levels and spectra",
      whyItMatters: "Core topic in Quantum Physics: Energy levels and spectra.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Energy levels and spectra",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Atoms",
      ],
      summary:
        "Energy levels and spectra is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-orbitals",
      module: "Atoms",
      title: "Orbitals and quantum numbers",
      whyItMatters: "Core topic in Quantum Physics: Orbitals and quantum numbers.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Orbitals and quantum numbers",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Atoms",
      ],
      summary:
        "Orbitals and quantum numbers is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-super",
      module: "Core principles",
      title: "Superposition",
      whyItMatters: "Core topic in Quantum Physics: Superposition.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Superposition",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Core principles",
      ],
      summary:
        "Superposition is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-measure",
      module: "Core principles",
      title: "Measurement and collapse",
      whyItMatters: "Core topic in Quantum Physics: Measurement and collapse.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Measurement and collapse",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Core principles",
      ],
      summary:
        "Measurement and collapse is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-uncert",
      module: "Core principles",
      title: "Uncertainty principle",
      whyItMatters: "Core topic in Quantum Physics: Uncertainty principle.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Uncertainty principle",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Core principles",
      ],
      summary:
        "Uncertainty principle is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-entangle",
      module: "Core principles",
      title: "Entanglement",
      whyItMatters: "Core topic in Quantum Physics: Entanglement.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Entanglement",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Core principles",
      ],
      summary:
        "Entanglement is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-schrod",
      module: "Formalism",
      title: "Schr\u00f6dinger equation",
      whyItMatters: "Core topic in Quantum Physics: Schr\u00f6dinger equation.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Schr\u00f6dinger equation",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Formalism",
      ],
      summary:
        "Schr\u00f6dinger equation is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-wavefn",
      module: "Formalism",
      title: "Wave functions and probability",
      whyItMatters: "Core topic in Quantum Physics: Wave functions and probability.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Wave functions and probability",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Formalism",
      ],
      summary:
        "Wave functions and probability is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-operators",
      module: "Formalism",
      title: "Operators and observables",
      whyItMatters: "Core topic in Quantum Physics: Operators and observables.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Operators and observables",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Formalism",
      ],
      summary:
        "Operators and observables is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-spin",
      module: "Spin and statistics",
      title: "Spin",
      whyItMatters: "Core topic in Quantum Physics: Spin.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Spin",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Spin and statistics",
      ],
      summary: "Spin is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-pauli",
      module: "Spin and statistics",
      title: "Pauli exclusion principle",
      whyItMatters: "Core topic in Quantum Physics: Pauli exclusion principle.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Pauli exclusion principle",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Spin and statistics",
      ],
      summary:
        "Pauli exclusion principle is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-tunnel",
      module: "Applications",
      title: "Quantum tunnelling",
      whyItMatters: "Core topic in Quantum Physics: Quantum tunnelling.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Quantum tunnelling",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Applications",
      ],
      summary:
        "Quantum tunnelling is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-laser",
      module: "Applications",
      title: "Lasers",
      whyItMatters: "Core topic in Quantum Physics: Lasers.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Lasers",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Applications",
      ],
      summary: "Lasers is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-semi",
      module: "Applications",
      title: "Semiconductors and bands",
      whyItMatters: "Core topic in Quantum Physics: Semiconductors and bands.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Semiconductors and bands",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Applications",
      ],
      summary:
        "Semiconductors and bands is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-info",
      module: "Quantum information",
      title: "Qubits",
      whyItMatters: "Core topic in Quantum Physics: Qubits.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Qubits",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Quantum information",
      ],
      summary: "Qubits is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-gate",
      module: "Quantum information",
      title: "Quantum gates",
      whyItMatters: "Core topic in Quantum Physics: Quantum gates.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Quantum gates",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Quantum information",
      ],
      summary:
        "Quantum gates is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-compute",
      module: "Quantum information",
      title: "Quantum computing ideas",
      whyItMatters: "Core topic in Quantum Physics: Quantum computing ideas.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Quantum computing ideas",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Quantum information",
      ],
      summary:
        "Quantum computing ideas is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-crypto",
      module: "Quantum information",
      title: "Quantum cryptography",
      whyItMatters: "Core topic in Quantum Physics: Quantum cryptography.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Quantum cryptography",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Quantum information",
      ],
      summary:
        "Quantum cryptography is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-field",
      module: "Advanced",
      title: "Quantum fields (overview)",
      whyItMatters: "Core topic in Quantum Physics: Quantum fields (overview).",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Quantum fields (overview)",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Advanced",
      ],
      summary:
        "Quantum fields (overview) is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
    {
      id: "quan-rel",
      module: "Advanced",
      title: "Relativistic Quantum ideas",
      whyItMatters: "Core topic in Quantum Physics: Relativistic Quantum ideas.",
      minutes: 25,
      keyIdeas: [
        "Definition and scope of Relativistic Quantum ideas",
        "Mechanisms and evidence from established physics",
        "Links to neighbouring topics in Advanced",
      ],
      summary:
        "Relativistic Quantum ideas is a standard topic in Quantum Physics. Master definitions, mechanisms, and experimental evidence.",
    },
  ],
  landmarks: [
    {
      title: "On the theory of the energy distribution law of the normal spectrum",
      authors: "Max Planck",
      year: 1900,
      significance: "Introduced energy quanta; foundation of Quantum theory.",
    },
    {
      title: "On a heuristic point of view concerning the production and transformation of light",
      authors: "Albert Einstein",
      year: 1905,
      significance: "Photoelectric effect and light quanta (photons).",
    },
    {
      title: "Quantisierung als Eigenwertproblem",
      authors: "Erwin Schr\u00f6dinger",
      year: 1926,
      significance: "Wave mechanics and the Schr\u00f6dinger equation.",
    },
  ],
} as ScienceField;

export default field;
