import type { Concept } from "../sciences-types";

/** Remaining Ecology lessons (expanded versions land here next). */
export const ecologyConceptsB: Concept[] = [
  {
    id: "eco-energy",
    module: "Ecosystem Science",
    title: "Energy flow in ecosystems",
    whyItMatters: "GPP, NPP, efficiency, and pyramids are core calculation and graph topics.",
    minutes: 45,
    keyIdeas: [
      "NPP = GPP minus autotroph respiration.",
      "Energy flows one way; matter cycles.",
      "Ecological efficiency is typically low (often 5 to 20 percent).",
      "Pyramids of energy are always upright.",
    ],
    summary:
      "Energy enters ecosystems when producers fix solar or chemical energy as organic compounds. GPP measures total fixation. Producers respire part of this energy; NPP is the remainder stored in biomass and available to herbivores and decomposers.\n\nConsumers convert only part of ingested energy into their own biomass. Losses include uneaten tissue, faeces, and respiratory heat. Therefore energy available declines sharply at successive trophic levels.\n\nEnergy is not recycled: continuous sunlight (or chemical energy at vents) is required. Exam questions often give energy values at each level and ask for efficiency or for comparison of pyramid types.\n\nWorked pattern: if GPP is 20000 kJ m-2 yr-1 and plant respiration is 8000, NPP is 12000. If herbivores add 1200 kJ of new biomass, efficiency from producers to primary consumers is about 10 percent.",
    checkQuestions: [
      "Write the equation linking GPP, NPP, and respiration.",
      "Why is a pyramid of energy always upright?",
    ],
  },
  {
    id: "eco-nut",
    module: "Ecosystem Science",
    title: "Nutrient cycles",
    whyItMatters: "Carbon and nitrogen cycles, pools, fluxes, and human disruption are standard exam diagrams.",
    minutes: 45,
    keyIdeas: [
      "Matter cycles; energy flows.",
      "Most organisms cannot use N2 until it is fixed.",
      "N or P often limit primary production.",
      "Agricultural runoff links land use to aquatic eutrophication.",
    ],
    summary:
      "Nutrient cycles track elements between organisms and abiotic reservoirs. Carbon moves through photosynthesis and respiration and more slowly through oceans, soils, and rocks. Fossil fuel combustion and deforestation raise atmospheric CO2.\n\nNitrogen gas is abundant but unavailable to most species until fixed by bacteria (including symbiotic Rhizobium) or by the Haber-Bosch process. Nitrification produces nitrite and nitrate; plants assimilate these; animals eat organic nitrogen; decomposers release ammonium; denitrifiers close the atmospheric loop.\n\nPhosphorus lacks a large atmospheric pool and limits many freshwaters. Exam diagrams must show both biological and abiotic arrows and named human impacts on specific fluxes.",
  },
  {
    id: "eco-growth",
    module: "Population Ecology",
    title: "Population growth",
    whyItMatters: "Exponential vs logistic curves, K, and density dependence are graph-heavy exam staples.",
    minutes: 45,
    keyIdeas: [
      "Population change equals births minus deaths plus immigration minus emigration.",
      "Logistic model reduces growth as N approaches K.",
      "Density-dependent factors intensify with N.",
    ],
    summary:
      "Population size changes through births, deaths, and migration. With abundant resources, per-capita growth can be roughly constant, giving exponential J-shaped growth. As density rises, competition, disease, and other pressures usually increase, slowing growth.\n\nThe logistic model captures this with an S-shaped approach to carrying capacity K. K depends on the environment and can change. Density-dependent factors strengthen with density; density-independent factors (severe weather) do not scale the same way.\n\nExam papers show curves to label, ask for K, or classify factors from a scenario.",
  },
  {
    id: "eco-int",
    module: "Population Ecology",
    title: "Species interactions",
    whyItMatters: "Classify +/-/0 interactions and apply exclusion, partitioning, and mutualism.",
    minutes: 40,
    keyIdeas: [
      "Competition is -/-; predation and parasitism are +/-; mutualism is +/+.",
      "Niche overlap predicts competition strength.",
      "Partitioning allows coexistence.",
    ],
    summary:
      "Interactions structure communities. Competition harms both parties when a resource is limiting. Predation and parasitism benefit one species and harm the other. Mutualism benefits both, as in many pollination systems and mycorrhizae.\n\nCompetitive exclusion and resource partitioning are central theory for coexistence. Exam scenarios describe feeding heights, activity times, or removal experiments and ask which interaction or mechanism is shown.",
  },
  {
    id: "eco-comp",
    module: "Population Ecology",
    title: "Competition",
    whyItMatters: "Intra- vs interspecific competition, niche, and experiment interpretation.",
    minutes: 40,
    keyIdeas: [
      "Competition requires a shared limiting resource.",
      "Intraspecific competition is a major density-dependent check.",
      "Always name the resource in exam answers.",
    ],
    summary:
      "Competition is a -/- interaction over limited resources such as light, nutrients, water, or nest sites. Intraspecific competition intensifies as population density rises. Interspecific competition occurs between species with overlapping niches.\n\nClassic laboratory experiments showed one species can exclude another under constant conditions, while field environments often allow partitioning.",
  },
  {
    id: "eco-biodiv",
    module: "Community Ecology",
    title: "Biodiversity",
    whyItMatters: "Genetic, species, and ecosystem diversity; richness vs evenness; threats.",
    minutes: 40,
    keyIdeas: [
      "Diversity includes genes, species, and ecosystems.",
      "Richness counts species; evenness describes balance of abundances.",
      "Habitat loss, overexploitation, climate change, pollution, and invasives drive losses.",
    ],
    summary:
      "Biodiversity is variation at genetic, species, and ecosystem levels. Species diversity combines richness and evenness. Global patterns include higher richness toward the equator for many terrestrial groups.\n\nHuman pressures elevate extinction risk. Conservation prioritises endemic-rich threatened regions and viable population sizes.",
  },
  {
    id: "eco-rel",
    module: "Community Ecology",
    title: "Community structure and succession",
    whyItMatters: "Keystone species, succession, and trophic cascades.",
    minutes: 40,
    keyIdeas: [
      "Keystones maintain structure beyond their biomass share.",
      "Primary succession starts on bare substrate; secondary retains soil.",
      "Predator removal can increase herbivores and reduce plants.",
    ],
    summary:
      "Community structure depends on interaction strengths. Keystone predators can prevent herbivores from overgrazing foundation species such as kelp. Succession describes recovery after lava, retreat of ice, fire, or farming. Trophic cascades link top predators to vegetation.",
  },
  {
    id: "eco-wild",
    module: "Conservation Biology",
    title: "Wildlife protection",
    whyItMatters: "In-situ vs ex-situ methods, small populations, and corridors.",
    minutes: 40,
    keyIdeas: [
      "Habitat protection underpins most successful conservation.",
      "Small populations face demographic and genetic risks.",
      "Corridors reduce isolation of fragments.",
    ],
    summary:
      "Wildlife protection aims for viable wild populations. In-situ measures protect habitats and reduce overexploitation. Fragmentation isolates groups; corridors reconnect them. Small populations lose genetic variation and are vulnerable to chance events. Captive breeding and seed banks are insurance tools with costs and limits.",
  },
  {
    id: "eco-hab",
    module: "Conservation Biology",
    title: "Habitat restoration",
    whyItMatters: "Assisting recovery using succession and reference ecosystems.",
    minutes: 40,
    keyIdeas: [
      "Remove stressors before or while replanting.",
      "Hydrology and soil often limit recovery.",
      "Success is measured by structure and function, not only stem counts.",
    ],
    summary:
      "Restoration assists recovery of damaged ecosystems toward a reference state. Priorities often include restoring water regimes, controlling invasives, stabilising soils, and reintroducing native species in sensible order. Monitoring compares trajectories to references over years.",
  },
  {
    id: "eco-ext",
    module: "Conservation Biology",
    title: "Extinction",
    whyItMatters: "Background vs mass extinction and modern drivers.",
    minutes: 40,
    keyIdeas: [
      "Extinction is natural; modern rates for many groups are elevated.",
      "Habitat loss is a leading terrestrial driver.",
      "Island endemics often lack defenses against introduced predators.",
    ],
    summary:
      "The fossil record shows background extinctions and rare mass events. Current losses are driven heavily by habitat conversion, overharvest, climate change, pollution, and invasive species. Island biogeography explains why small isolated habitats support fewer species and recover slowly from local extinction.",
  },
  {
    id: "eco-imp",
    module: "Climate Ecology",
    title: "Climate impacts on ecosystems",
    whyItMatters: "Range shifts, phenology, bleaching, and barriers to tracking climate.",
    minutes: 40,
    keyIdeas: [
      "Species shift ranges if dispersal and habitat allow.",
      "Phenological mismatches disrupt food and pollination links.",
      "Fragmented habitats block range shifts.",
    ],
    summary:
      "Warming moves thermal niches. Many species have shifted poleward or uphill; spring events often occur earlier. Mismatches arise when interacting species shift differently. Coral bleaching follows breakdown of coral-alga symbiosis under heat stress. Mountain-top and island species may run out of habitat.",
  },
  {
    id: "eco-carbon",
    module: "Climate Ecology",
    title: "Carbon cycles and ecosystems",
    whyItMatters: "Sources, sinks, feedbacks, and limits of tree-planting claims.",
    minutes: 40,
    keyIdeas: [
      "Photosynthesis removes CO2; respiration and combustion add it.",
      "Oceans absorb large CO2 amounts but acidify.",
      "Nature-based solutions complement but do not replace emission cuts.",
    ],
    summary:
      "Ecosystems exchange carbon with the atmosphere through photosynthesis and respiration. Land clearing releases stored carbon and reduces future uptake. Oceans are major sinks with acidification as a trade-off. Thawing permafrost and drying peat can amplify warming via positive feedbacks. Tree planting helps only with the right species, permanence, and alongside fossil fuel reductions.",
  },
  {
    id: "eco-env",
    module: "Climate Ecology",
    title: "Multiple environmental stressors",
    whyItMatters: "Combined climate, pollution, invasives, and land-use effects.",
    minutes: 35,
    keyIdeas: [
      "Stressors interact and can act synergistically.",
      "Single-stressor management can fail.",
    ],
    summary:
      "Ecosystems face combined pressures: climate change, habitat loss, overharvest, invasives, and pollution. Synergy means combined damage can exceed separate effects. Coral reefs and lakes are classic multi-stressor exam cases. Management must identify dominant local drivers.",
  },
  {
    id: "eco-ag",
    module: "Applied Ecology",
    title: "Agriculture and ecosystems",
    whyItMatters: "Agroecosystems, monoculture, and ecological management practices.",
    minutes: 40,
    keyIdeas: [
      "Agriculture redirects NPP to humans and simplifies communities.",
      "Monocultures can be productive but pest-prone.",
      "Pollinators and natural enemies are ecosystem services to farms.",
    ],
    summary:
      "Agroecosystems are managed for production and usually have lower diversity than replaced ecosystems. Monocultures raise efficiency for one product but can amplify pests and deplete soils without careful management. Ecological practices include rotation, habitat for enemies of pests, and integrated pest management.",
  },
  {
    id: "eco-plan",
    module: "Applied Ecology",
    title: "Conservation planning",
    whyItMatters: "Reserve design, edge effects, and prioritisation.",
    minutes: 35,
    keyIdeas: [
      "Larger reserves support larger populations and more species on average.",
      "Connectivity aids dispersal and recolonisation.",
      "Edges reduce core habitat.",
    ],
    summary:
      "Planning places protection where it achieves the most under constraints. Island biogeography informs size and isolation. Edge effects make shape important. Complementarity avoids double-counting the same common species. Social and enforcement realities decide whether plans work.",
  },
  {
    id: "eco-sd",
    module: "Applied Ecology",
    title: "Sustainable development and ecology",
    whyItMatters: "Ecosystem services and ecological limits in development arguments.",
    minutes: 35,
    keyIdeas: [
      "Ecosystems provide food, water purification, climate regulation, and cultural value.",
      "Overusing provisioning services can degrade regulating services.",
    ],
    summary:
      "Sustainability connects ecology to long-term human well-being. Ecosystem services classify benefits from nature. Trade-offs are central: wetland conversion may raise crop output but lose flood control. Arguments should use nutrient cycles, population limits, and biodiversity function rather than slogans alone.",
  },
];
