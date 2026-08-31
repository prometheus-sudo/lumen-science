import type { Concept } from '../sciences-types';

export const ecologyConceptsA: Concept[] = [
    {
      id: "eco-food",
      module: "Ecosystem Science",
      title: "Food chains and food webs",
      whyItMatters: "Exams test trophic levels, webs from data, energy limits on chain length, and diagram conventions.",
      minutes: 50,
      objectives: [
        "Define producer, consumer, decomposer, and trophic level with examples",
        "Construct a food chain and a food web from a species list",
        "Explain why energy transfer limits the length of food chains",
        "Distinguish food chain, food web, and ecological pyramid types",
        "Predict community effects of removing a top predator or key herbivore",
      ],
      terms: [
        { term: "Producer (autotroph)", definition: "Organism that makes organic compounds from inorganic sources, usually by photosynthesis (plants, algae, cyanobacteria) or rarely by chemosynthesis." },
        { term: "Consumer (heterotroph)", definition: "Organism that obtains organic matter by feeding on other organisms or their remains." },
        { term: "Primary consumer", definition: "Herbivore or grazer feeding mainly on producers; occupies trophic level 2." },
        { term: "Trophic level", definition: "Feeding position in a chain: producers = 1; primary consumers = 2; secondary consumers = 3; and so on." },
        { term: "Food chain", definition: "Single linear feeding path showing energy transfer from producers through successive consumers." },
        { term: "Food web", definition: "Network of interlinked food chains reflecting real diets that include multiple prey and predators." },
        { term: "Decomposer", definition: "Organism (mainly bacteria and fungi) that breaks down dead organic matter and releases inorganic nutrients." },
      ],
      keyIdeas: [
        "Energy enters most ecosystems as sunlight captured by producers.",
        "A food chain is linear; a food web is a network of chains.",
        "Only a fraction of energy (often cited near 10% as a rule of thumb) passes to the next trophic level.",
        "Decomposers recycle matter; energy still dissipates as heat and is not recycled.",
        "Arrows in diagrams show direction of energy flow: from prey toward the consumer.",
        "Pyramids of energy are always upright; pyramids of numbers or biomass can invert.",
      ],
      summary: `Food chains and food webs are how ecologists formalise who eats whom and how energy moves through living systems. If you can build a chain, expand it into a web, label trophic levels, and explain why energy pyramids narrow, you can answer most exam questions in this topic.\n\nStart with producers. Producers (autotrophs) make organic compounds from inorganic materials. Green plants, algae, and cyanobacteria do this by photosynthesis: they use light energy to fix carbon dioxide into sugars. In some ecosystems (deep-sea vents, some sediments) chemosynthetic bacteria are the producers. Producers occupy trophic level 1. Everything else depends on them, directly or indirectly.\n\nConsumers (heterotrophs) obtain organic matter by feeding. Primary consumers (herbivores, many filter-feeders on phytoplankton) occupy level 2. Secondary consumers feed on primary consumers; tertiary consumers feed higher still. Omnivores may occupy more than one level depending on the meal. Detritivores and decomposers feed on dead organic matter. Decomposers (bacteria and fungi) break complex organic compounds into inorganic nutrients that producers can use again. Matter is recycled; energy is not.\n\nA food chain is one feeding path. Example: phytoplankton → zooplankton → herring → seal. Real communities are not single paths. Most species eat more than one kind of food and are eaten by more than one predator. A food web links many chains into a network. Exam questions often give a species list and feeding notes and ask you to draw a web, then identify producers, top predators, or omnivores.\n\nEnergy transfer between levels is inefficient. Not all biomass is eaten. Of what is eaten, not all is digested. Of what is digested, much is used in respiration and lost as heat. A common teaching rule of thumb is that about 10% of the energy at one level is incorporated into biomass at the next, but real efficiencies vary (often roughly 5–20%). Because energy declines so sharply, food chains are usually short (often 3–5 links). Long chains are energetically expensive to support.\n\nEcological pyramids summarise this structure. A pyramid of energy plots energy flow (or productivity) at each level per unit area per unit time; it is always upright. A pyramid of numbers counts individuals; it can invert (one large tree supporting thousands of insects). A pyramid of biomass can also invert (for example, a small standing crop of phytoplankton supporting a larger biomass of zooplankton when phytoplankton turn over quickly). Never use an inverted numbers pyramid to claim that energy flow is inverted.\n\nDiagram conventions matter. Arrows point toward the consumer (direction of energy flow). Removing a top predator can increase herbivores and reduce plants (a trophic cascade). Removing a producer base collapses higher levels. When you answer “explain” questions, name the mechanism: less energy available, less biomass supported, fewer individuals at higher levels, or altered interaction strengths in the web.\n\nWorked check: given grass, grasshopper, frog, snake, hawk, bacteria — draw one chain, then a web if grasshopper and frog share predators, label levels, and state why adding a sixth animal level is unlikely to be stable on the same grass energy budget.`,
      checkQuestions: [
        "Define trophic level and state the level of a secondary consumer.",
        "Why are food chains rarely longer than four or five links?",
        "Distinguish food chain from food web with one example of each.",
        "Sketch a pyramid of energy for three levels and explain its shape.",
        "Why can a pyramid of numbers invert while a pyramid of energy cannot?",
      ],
      pitfalls: [
        "Drawing arrows toward the prey instead of toward the consumer.",
        "Treating the 10% figure as an exact universal law.",
        "Placing decomposers only at the top of every chain.",
        "Confusing biomass pyramids with energy pyramids.",
      ],
    },
];
