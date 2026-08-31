import type { ScienceField } from "../sciences-types";

const field = {
  slug: "ecology",
  name: "Ecology",
  tagline: "Organisms, environments, and systems they form.",
  overview: "Ecology studies interactions among organisms and their environments. Energy flow, nutrient cycles, populations, communities, conservation, and climate links form the examinable core. Lessons are written for secondary and introductory university assessment: definitions, mechanisms, graphs, and common pitfalls.",
  searchQuery: "ecology energy flow nutrient cycles population dynamics open access",
  subfields: ["Ecosystems", "Populations", "Communities", "Conservation", "Climate", "Applied"],
  concepts: [
    {
      id: "eco-food",
      module: "Ecosystem Science",
      title: "Food chains and food webs",
      whyItMatters: "Exams test trophic levels, webs from data, and why chains are short.",
      minutes: 25,
      objectives: ["Define producer, consumer, decomposer, trophic level", "Construct a food chain and web from given species", "Explain energy transfer limits on chain length", "Distinguish food chain from food web"],
      terms: [
        { term: "Producer (autotroph)", definition: "Organism making organic compounds from inorganic sources, usually by photosynthesis." },
        { term: "Consumer (heterotroph)", definition: "Organism obtaining organic matter by feeding on others or their remains." },
        { term: "Trophic level", definition: "Position in a food chain: producers level 1; primary consumers level 2; etc." },
        { term: "Food web", definition: "Network of interlinked food chains in a community." }
      ],
      keyIdeas: ["Energy enters most ecosystems as sunlight captured by producers.", "Food chain is linear; food web is a network of chains.", "Only a fraction of energy (often ~10% as a rule of thumb) passes to the next trophic level.", "Decomposers recycle matter; energy still dissipates as heat.", "Arrows in diagrams show energy flow: prey to predator."],
      summary: "A food chain is a single feeding path: producer to primary consumer to higher consumers. Example: phytoplankton to zooplankton to small fish to large fish. A food web links many such chains because most species eat more than one prey and have more than one predator.\n\nProducers form trophic level 1. Herbivores are primary consumers. Carnivores feeding on herbivores are secondary consumers. Decomposers and detritivores break down dead material and release inorganic nutrients, coupling energy flow diagrams to nutrient cycles.\n\nEnergy transfer is inefficient. Biomass is not fully consumed, digestion is incomplete, and respiration releases heat. That is why ecological pyramids of energy are upright and why long chains are rare. Pyramids of numbers or biomass can invert (for example one tree supporting many insects) but energy pyramids do not.\n\nTypical exam tasks: draw a web from a species list, label trophic levels, predict effects of removing a top predator, or explain the shape of an energy pyramid.",
      checkQuestions: ["Define trophic level and state the level of a secondary consumer.", "Why are food chains rarely longer than four or five links?", "Distinguish food chain from food web.", "Sketch a pyramid of energy for three levels and explain it."],
      pitfalls: ["Drawing arrows towards the prey instead of towards the consumer.", "Treating the 10 percent rule as an exact law.", "Placing decomposers only at the top of every chain."]
    },
    {
      id: "eco-energy",
      module: "Ecosystem Science",
      title: "Energy flow in ecosystems",
      whyItMatters: "GPP, NPP, efficiency, and pyramids are core calculation and graph topics.",
      minutes: 28,
      objectives: ["Distinguish GPP, NPP, and secondary production", "Calculate ecological efficiency from data", "Explain continuous energy input", "Interpret energy, biomass, and number pyramids"],
      terms: [
        { term: "Gross primary production (GPP)", definition: "Total chemical energy fixed by producers per unit area per unit time." },
        { term: "Net primary production (NPP)", definition: "GPP minus producer respiration; energy available to consumers as new plant biomass." },
        { term: "Ecological efficiency", definition: "Percentage of energy at one trophic level incorporated into the next." }
      ],
      keyIdeas: ["NPP = GPP minus autotroph respiration.", "Energy flows one way; matter cycles.", "Ecological efficiency is typically low (often 5 to 20 percent).", "Pyramids of energy are always upright.", "Light, water, nutrients, and temperature can limit production."],
      summary: "Energy enters ecosystems when producers fix solar or chemical energy as organic compounds. GPP measures total fixation. Producers respire part of this energy; NPP is the remainder stored in biomass and available to herbivores and decomposers.\n\nConsumers convert only part of ingested energy into their own biomass. Losses include uneaten tissue, faeces, and respiratory heat. Therefore energy available declines sharply at successive trophic levels.\n\nEnergy is not recycled: continuous sunlight (or chemical energy at vents) is required. Exam questions often give energy values at each level and ask for efficiency or for comparison of pyramid types.",
      checkQuestions: ["Write the equation linking GPP, NPP, and respiration.", "If GPP is 12000 kJ and plant respiration is 5000 kJ, what is NPP?", "Why is a pyramid of energy always upright?", "Name two factors that can limit NPP."],
      pitfalls: ["Confusing GPP with NPP.", "Stating that energy is recycled like nutrients.", "Using an inverted numbers pyramid to claim energy flow is inverted."]
    },
    {
      id: "eco-nut",
      module: "Ecosystem Science",
      title: "Nutrient cycles",
      whyItMatters: "Carbon and nitrogen cycles, pools, fluxes, and human disruption are standard exam diagrams.",
      minutes: 30,
      objectives: ["Describe main carbon pools and fluxes", "Outline fixation, nitrification, assimilation, denitrification", "Explain human alteration of C and N cycles", "Link limiting nutrients to NPP"],
      terms: [
        { term: "Nitrogen fixation", definition: "Conversion of N2 into forms usable by organisms, by microbes or industry." },
        { term: "Denitrification", definition: "Microbial conversion of nitrate to N2 or N2O, returning nitrogen to air." },
        { term: "Pool", definition: "A store of a nutrient such as atmospheric CO2 or soil organic matter." }
      ],
      keyIdeas: ["Matter cycles; energy flows.", "Photosynthesis and respiration exchange carbon; fossil fuels add net CO2.", "Most organisms cannot use N2 until it is fixed.", "N or P often limit primary production.", "Agricultural runoff links land use to aquatic eutrophication."],
      summary: "Nutrient cycles track elements between organisms and abiotic reservoirs. Carbon moves quickly through photosynthesis and respiration and more slowly through oceans, soils, and rocks. Fossil fuel combustion and deforestation raise atmospheric CO2 and strengthen the greenhouse effect.\n\nNitrogen gas is abundant but unavailable to most species until fixed by bacteria (including symbiotic Rhizobium) or by the Haber-Bosch process. Nitrification produces nitrite and nitrate; plants assimilate these; animals eat organic nitrogen; decomposers release ammonium; denitrifiers close the atmospheric loop.\n\nPhosphorus lacks a large atmospheric pool and limits many freshwaters. Exam diagrams must show both biological and abiotic arrows and named human impacts on specific fluxes.",
      checkQuestions: ["Name two processes that remove atmospheric CO2 and two that add it.", "Why is nitrogen fixation essential?", "How can fertiliser use contribute to coastal dead zones?", "What is a limiting nutrient?"],
      pitfalls: ["Writing that plants absorb N2 directly.", "Omitting decomposers from cycle diagrams.", "Confusing nitrification with fixation."]
    },
    {
      id: "eco-growth",
      module: "Population Ecology",
      title: "Population growth",
      whyItMatters: "Exponential vs logistic curves, K, and density dependence are graph-heavy exam staples.",
      minutes: 28,
      objectives: ["Define population, density, carrying capacity", "Contrast exponential and logistic curves", "Distinguish density-dependent and independent factors", "Interpret age structure qualitatively"],
      terms: [
        { term: "Carrying capacity (K)", definition: "Maximum population size the environment can sustain given resources and conditions." },
        { term: "Exponential growth", definition: "Growth at constant per-capita rate producing a J-shaped curve when resources are not limiting." },
        { term: "Logistic growth", definition: "Growth that slows as N approaches K, producing an S-shaped curve in the simple model." }
      ],
      keyIdeas: ["Population change equals births minus deaths plus immigration minus emigration.", "Logistic model reduces growth as density nears K.", "Density-dependent factors intensify with N.", "Density-independent factors act regardless of density.", "Real populations may overshoot, oscillate, or crash."],
      summary: "Population size changes through births, deaths, and migration. With abundant resources, per-capita growth can be roughly constant, giving exponential J-shaped growth. As density rises, competition, disease, and other pressures usually increase, slowing growth.\n\nThe logistic model captures this with an S-shaped approach to carrying capacity K. K depends on the environment and can change. Density-dependent factors (competition, many diseases) strengthen with density; density-independent factors (severe weather) do not scale the same way.\n\nExam papers show curves to label, ask for K, or classify factors from a scenario.",
      checkQuestions: ["Sketch and label exponential and logistic curves.", "Define K and give one reason it can change.", "Give two density-dependent and two density-independent factors.", "What happens to logistic growth rate as N approaches K?"],
      pitfalls: ["Treating K as permanently fixed.", "Claiming exponential growth never occurs.", "Confusing density with total numbers only."]
    },
    {
      id: "eco-int",
      module: "Population Ecology",
      title: "Species interactions",
      whyItMatters: "Classify +/-/0 interactions and apply exclusion, partitioning, and mutualism.",
      minutes: 26,
      objectives: ["Classify interactions by fitness effect", "Explain competitive exclusion and partitioning", "Describe predation and mutualism with examples", "Use scenarios to name interaction types"],
      terms: [
        { term: "Competitive exclusion", definition: "Two species with identical limiting requirements cannot coexist indefinitely in a stable environment." },
        { term: "Resource partitioning", definition: "Species use different resources, places, or times, reducing competition." },
        { term: "Mutualism", definition: "Interaction in which both species gain fitness." }
      ],
      keyIdeas: ["Competition is -/-; predation and parasitism are +/-; mutualism is +/+.", "Niche overlap predicts competition strength.", "Partitioning allows coexistence.", "Predator-prey systems can oscillate in models.", "Coevolution shapes defenses and counter-defenses."],
      summary: "Interactions structure communities. Competition harms both parties when a resource is limiting. Predation and parasitism benefit one species and harm the other. Mutualism benefits both, as in many pollination systems and mycorrhizae. Commensalism is +/0 and is harder to demonstrate cleanly in the field.\n\nCompetitive exclusion and resource partitioning are central theory for coexistence. Exam scenarios describe feeding heights, activity times, or removal experiments and ask which interaction or mechanism is shown.",
      checkQuestions: ["Make a table of interaction types with +/-/0.", "State competitive exclusion and one coexistence mechanism.", "Distinguish predation from parasitism.", "Give a mutualism and benefits to each partner."],
      pitfalls: ["Using symbiosis without specifying fitness effects.", "Assuming competition always eliminates one species."]
    },
    {
      id: "eco-comp",
      module: "Population Ecology",
      title: "Competition",
      whyItMatters: "Intra- vs interspecific competition, niche, and experiment interpretation.",
      minutes: 22,
      objectives: ["Distinguish intra- and interspecific competition", "Relate competition to the niche", "Interpret competition experiment outcomes", "Link competition to density dependence"],
      terms: [
        { term: "Intraspecific competition", definition: "Competition among members of the same species." },
        { term: "Interspecific competition", definition: "Competition among members of different species." },
        { term: "Ecological niche", definition: "Conditions tolerated and resources used by a species." }
      ],
      keyIdeas: ["Competition requires a shared limiting resource.", "Intraspecific competition is a major density-dependent check.", "Niche overlap indicates potential interspecific competition.", "Exploitation acts via resource depletion; interference is direct.", "Outcomes depend on environmental conditions."],
      summary: "Competition is a -/- interaction over limited resources such as light, nutrients, water, or nest sites. Intraspecific competition intensifies as population density rises. Interspecific competition occurs between species with overlapping niches.\n\nClassic laboratory experiments showed one species can exclude another under constant conditions, while field environments often allow partitioning. Always name the resource in exam answers.",
      checkQuestions: ["Why does intraspecific competition increase with density?", "What is niche overlap?", "Distinguish exploitative from interference competition.", "Why might the winner of competition reverse if temperature changes?"],
      pitfalls: ["Discussing competition without naming the resource."]
    },
    {
      id: "eco-biodiv",
      module: "Community Ecology",
      title: "Biodiversity",
      whyItMatters: "Genetic, species, and ecosystem diversity; richness vs evenness; threats.",
      minutes: 26,
      objectives: ["Define three levels of biodiversity", "Distinguish richness and evenness", "Describe the latitudinal diversity gradient", "List major drivers of modern diversity loss"],
      terms: [
        { term: "Species richness", definition: "Number of species in a defined area or sample." },
        { term: "Species evenness", definition: "How equal species abundances are." },
        { term: "Endemic species", definition: "Species restricted to a particular region." }
      ],
      keyIdeas: ["Diversity includes genes, species, and ecosystems.", "Richness counts species; evenness describes balance of abundances.", "Many groups are richer in the tropics.", "Habitat loss, overexploitation, climate change, pollution, and invasives drive losses.", "Hotspots combine high endemism with threat."],
      summary: "Biodiversity is variation at genetic, species, and ecosystem levels. Species diversity combines richness and evenness. Global patterns include higher richness toward the equator for many terrestrial groups.\n\nHuman pressures elevate extinction risk. Conservation prioritises endemic-rich threatened regions and viable population sizes. Exams may ask definitions, pattern recognition, or evaluation of a conservation measure.",
      checkQuestions: ["Distinguish richness from evenness.", "Name three levels of biodiversity.", "State the latitudinal diversity gradient.", "List five major human-driven threats."],
      pitfalls: ["Equating biodiversity only with species counts."]
    },
    {
      id: "eco-rel",
      module: "Community Ecology",
      title: "Community structure and succession",
      whyItMatters: "Keystone species, succession, and trophic cascades.",
      minutes: 26,
      objectives: ["Define keystone species with an example", "Contrast primary and secondary succession", "Explain a trophic cascade", "Relate disturbance to community composition"],
      terms: [
        { term: "Keystone species", definition: "Species with a disproportionately large effect on community structure relative to its abundance." },
        { term: "Succession", definition: "Directional change in community composition over time after disturbance or on new substrate." },
        { term: "Trophic cascade", definition: "Indirect effect of predators on lower levels via intermediate consumers." }
      ],
      keyIdeas: ["Keystones maintain structure beyond their biomass share.", "Primary succession starts on bare substrate; secondary retains soil.", "Pioneers tolerate harsh conditions; later species may dominate by competition.", "Predator removal can increase herbivores and reduce plants.", "Disturbance regimes shape which species persist."],
      summary: "Community structure depends on interaction strengths. Keystone predators can prevent herbivores from overgrazing foundation species such as kelp. Succession describes recovery after lava, retreat of ice, fire, or farming. Trophic cascades link top predators to vegetation. Exam scenarios describe removals or reintroductions and ask for predicted multi-level effects.",
      checkQuestions: ["Define keystone species and why abundance is a poor measure of importance.", "Contrast primary and secondary succession.", "Describe a three-level trophic cascade.", "How can disturbance influence richness?"],
      pitfalls: ["Calling every predator a keystone without evidence."]
    },
    {
      id: "eco-wild",
      module: "Conservation Biology",
      title: "Wildlife protection",
      whyItMatters: "In-situ vs ex-situ methods, small populations, and corridors.",
      minutes: 24,
      objectives: ["Distinguish in-situ and ex-situ conservation", "Explain vulnerability of small populations", "Describe roles of protected areas and corridors", "Evaluate limits of captive breeding"],
      terms: [
        { term: "In-situ conservation", definition: "Protecting species in natural habitats." },
        { term: "Ex-situ conservation", definition: "Protecting species outside natural habitats, such as captive breeding or seed banks." }
      ],
      keyIdeas: ["Habitat protection underpins most successful conservation.", "Small populations face demographic and genetic risks.", "Corridors reduce isolation of fragments.", "Ex-situ methods support but rarely replace wild populations.", "Enforcement and community support determine outcomes."],
      summary: "Wildlife protection aims for viable wild populations. In-situ measures protect habitats and reduce overexploitation. Fragmentation isolates groups; corridors reconnect them. Small populations lose genetic variation and are vulnerable to chance events. Captive breeding and seed banks are insurance tools with costs and limits. Exam answers should pair biological mechanisms with practical constraints.",
      checkQuestions: ["Compare in-situ and ex-situ conservation.", "Why are small populations extinction-prone?", "How do corridors help?", "State two limits of captive breeding."],
      pitfalls: ["Presenting zoos as a complete solution."]
    },
    {
      id: "eco-hab",
      module: "Conservation Biology",
      title: "Habitat restoration",
      whyItMatters: "Assisting recovery using succession and reference ecosystems.",
      minutes: 22,
      objectives: ["Define ecological restoration", "Use reference ecosystems in planning", "Order typical restoration actions", "Explain monitoring of success"],
      terms: [
        { term: "Ecological restoration", definition: "Assisting recovery of a degraded, damaged, or destroyed ecosystem." },
        { term: "Reference ecosystem", definition: "Model of desired composition and function guiding restoration goals." }
      ],
      keyIdeas: ["Remove stressors before or while replanting.", "Hydrology and soil often limit recovery more than seed availability alone.", "Succession theory guides species sequences.", "Success is measured by structure and function, not only stem counts.", "Climate change may shift appropriate targets."],
      summary: "Restoration assists recovery of damaged ecosystems toward a reference state. Priorities often include restoring water regimes, controlling invasives, stabilising soils, and reintroducing native species in sensible order. Monitoring compares trajectories to references over years. Exam case studies ask for a reasoned sequence of actions.",
      checkQuestions: ["What is a reference ecosystem?", "Why restore hydrology in wetlands before only planting?", "How does succession inform planting order?", "Name two success metrics."],
      pitfalls: ["Equating restoration with planting one tree species."]
    },
    {
      id: "eco-ext",
      module: "Conservation Biology",
      title: "Extinction",
      whyItMatters: "Background vs mass extinction and modern drivers.",
      minutes: 24,
      objectives: ["Distinguish background and mass extinction", "Explain island and endemic vulnerability", "Apply major modern extinction drivers", "Link extinction risk to range and population size"],
      terms: [
        { term: "Background extinction", definition: "Normal low rate of species loss over geological time." },
        { term: "Mass extinction", definition: "Interval with globally elevated extinction rates far above background." }
      ],
      keyIdeas: ["Extinction is natural; modern rates for many groups are elevated.", "Habitat loss is a leading terrestrial driver.", "Island endemics often lack defenses against introduced predators.", "Narrow-range species are vulnerable to local disasters.", "Extinction may lag decades after habitat loss."],
      summary: "The fossil record shows background extinctions and rare mass events. Current losses are driven heavily by habitat conversion, overharvest, climate change, pollution, and invasive species. Island biogeography explains why small isolated habitats support fewer species and recover slowly from local extinction. Exam answers should name mechanisms, not only humans.",
      checkQuestions: ["Contrast background and mass extinction.", "Why are island endemics vulnerable to invasive predators?", "List five major anthropogenic pressures.", "How does fragmentation raise extinction risk?"],
      pitfalls: ["Saying extinction only happens because of humans."]
    },
    {
      id: "eco-imp",
      module: "Climate Ecology",
      title: "Climate impacts on ecosystems",
      whyItMatters: "Range shifts, phenology, bleaching, and barriers to tracking climate.",
      minutes: 26,
      objectives: ["Describe phenology and range shifts", "Explain coral bleaching in outline", "Link warming to extinction risk for restricted species", "Relate fragmentation to climate tracking"],
      terms: [
        { term: "Phenology", definition: "Timing of seasonal biological events such as flowering or migration." },
        { term: "Range shift", definition: "Change in geographic distribution, often poleward or upslope under warming." },
        { term: "Coral bleaching", definition: "Loss of symbiotic algae from corals, often after sustained high temperature." }
      ],
      keyIdeas: ["Species shift ranges if dispersal and habitat allow.", "Phenological mismatches disrupt food and pollination links.", "Extreme heat, drought, and fire cause rapid mortality events.", "Ocean warming and acidification stress marine calcifiers.", "Fragmented habitats block range shifts."],
      summary: "Warming moves thermal niches. Many species have shifted poleward or uphill; spring events often occur earlier. Mismatches arise when interacting species shift differently. Coral bleaching follows breakdown of coral-alga symbiosis under heat stress. Mountain-top and island species may run out of habitat. Exams expect multi-level reasoning: physiology, population, community.",
      checkQuestions: ["What is a phenological mismatch?", "Explain coral bleaching.", "Why are mountain-top endemics at risk?", "How does fragmentation interact with range shifts?"],
      pitfalls: ["Assuming every species can move poleward without barriers."]
    },
    {
      id: "eco-carbon",
      module: "Climate Ecology",
      title: "Carbon cycles and ecosystems",
      whyItMatters: "Sources, sinks, feedbacks, and limits of tree-planting claims.",
      minutes: 26,
      objectives: ["Identify major biotic carbon fluxes", "Explain forests and oceans as sinks", "Describe a positive carbon-climate feedback", "Evaluate afforestation caveats"],
      terms: [
        { term: "Carbon sink", definition: "Reservoir that absorbs more carbon than it releases over a period." },
        { term: "Carbon source", definition: "Reservoir that releases more carbon than it absorbs over a period." }
      ],
      keyIdeas: ["Photosynthesis removes CO2; respiration and combustion add it.", "Deforestation is a source and a lost sink.", "Oceans absorb large CO2 amounts but acidify.", "Peat and permafrost store vulnerable carbon.", "Nature-based solutions complement but do not replace emission cuts."],
      summary: "Ecosystems exchange carbon with the atmosphere through photosynthesis and respiration. Land clearing releases stored carbon and reduces future uptake. Oceans are major sinks with acidification as a trade-off. Thawing permafrost and drying peat can amplify warming via positive feedbacks. Tree planting helps only with the right species, permanence, and alongside fossil fuel reductions.",
      checkQuestions: ["Define carbon sink with two examples.", "Two ways deforestation affects atmospheric CO2?", "Give a positive feedback involving permafrost.", "Two limits of afforestation as climate policy?"],
      pitfalls: ["Claiming trees alone offset any level of fossil emissions."]
    },
    {
      id: "eco-env",
      module: "Climate Ecology",
      title: "Multiple environmental stressors",
      whyItMatters: "Combined climate, pollution, invasives, and land-use effects.",
      minutes: 22,
      objectives: ["List major anthropogenic stressors", "Explain synergistic stress", "Apply to reefs or freshwater cases", "Argue for multi-driver management"],
      terms: [
        { term: "Invasive species", definition: "Non-native species that spread and cause ecological or economic harm." },
        { term: "Eutrophication", definition: "Nutrient enrichment causing blooms, oxygen loss, and community change." }
      ],
      keyIdeas: ["Stressors interact and can act synergistically.", "Invasives restructure food webs.", "Nutrient pollution couples farms to aquatic systems.", "Land-use change remains a dominant terrestrial pressure.", "Single-stressor management can fail."],
      summary: "Ecosystems face combined pressures: climate change, habitat loss, overharvest, invasives, and pollution. Synergy means combined damage can exceed separate effects. Coral reefs and lakes are classic multi-stressor exam cases. Management must identify dominant local drivers.",
      checkQuestions: ["Name four major pressure categories.", "What is synergistic stress?", "How do invasive predators threaten island birds?", "Why might cutting fishing pressure aid coral recovery under warming?"],
      pitfalls: ["Single-cause answers when the question lists several pressures."]
    },
    {
      id: "eco-ag",
      module: "Applied Ecology",
      title: "Agriculture and ecosystems",
      whyItMatters: "Agroecosystems, monoculture, and ecological management practices.",
      minutes: 24,
      objectives: ["Contrast natural and agroecosystems", "Explain monoculture risks", "Outline rotation, biological control, agroforestry ideas", "Discuss yield-diversity trade-offs"],
      terms: [
        { term: "Monoculture", definition: "Growing one crop species over a large area." },
        { term: "Biological control", definition: "Using natural enemies to suppress pests." }
      ],
      keyIdeas: ["Agriculture redirects NPP to humans and simplifies communities.", "Monocultures can be productive but pest-prone.", "Pollinators and natural enemies are ecosystem services to farms.", "Nutrient runoff links fields to water quality.", "Sustainable intensification seeks high yield with lower harm."],
      summary: "Agroecosystems are managed for production and usually have lower diversity than replaced ecosystems. Monocultures raise efficiency for one product but can amplify pests and deplete soils without careful management. Ecological practices include rotation, habitat for enemies of pests, and integrated pest management. Exam answers should weigh food production against environmental costs.",
      checkQuestions: ["Two ecological risks of monoculture?", "How can habitat for natural enemies reduce pesticide use?", "How does fertiliser cause downstream eutrophication?", "What is sustainable intensification?"],
      pitfalls: ["Ignoring soil as an ecological system."]
    },
    {
      id: "eco-plan",
      module: "Applied Ecology",
      title: "Conservation planning",
      whyItMatters: "Reserve design, edge effects, and prioritisation.",
      minutes: 22,
      objectives: ["Apply size and connectivity ideas to reserves", "Explain edge effects", "Define complementarity", "Recognise cost and enforcement constraints"],
      terms: [
        { term: "Edge effect", definition: "Altered conditions and species composition near habitat boundaries." },
        { term: "Complementarity", definition: "Choosing sites that add unprotected species to maximise total diversity conserved." }
      ],
      keyIdeas: ["Larger reserves support larger populations and more species on average.", "Connectivity aids dispersal and recolonisation.", "Edges reduce core habitat.", "Prioritise richness, endemism, threat, and cost.", "Protection without management can fail."],
      summary: "Planning places protection where it achieves the most under constraints. Island biogeography informs size and isolation. Edge effects make shape important. Complementarity avoids double-counting the same common species. Social and enforcement realities decide whether plans work.",
      checkQuestions: ["How does island biogeography inform reserve design?", "What is an edge effect?", "What is complementarity?", "One argument for a single large reserve and one for several small?"],
      pitfalls: ["Ignoring enforcement and human communities."]
    },
    {
      id: "eco-sd",
      module: "Applied Ecology",
      title: "Sustainable development and ecology",
      whyItMatters: "Ecosystem services and ecological limits in development arguments.",
      minutes: 22,
      objectives: ["Define sustainable development", "Classify ecosystem services with examples", "Explain a service trade-off", "Use ecological mechanisms in sustainability essays"],
      terms: [
        { term: "Sustainable development", definition: "Meeting present needs without compromising future generations' ability to meet theirs." },
        { term: "Ecosystem services", definition: "Benefits people obtain from ecosystems, including provisioning and regulating services." }
      ],
      keyIdeas: ["Ecosystems provide food, water purification, climate regulation, and cultural value.", "Overusing provisioning services can degrade regulating services.", "Stay within renewable rates of harvest and waste absorption.", "Technology and equity shape outcomes under ecological constraints.", "Empty slogans score poorly; mechanisms score well."],
      summary: "Sustainability connects ecology to long-term human well-being. Ecosystem services classify benefits from nature. Trade-offs are central: wetland conversion may raise crop output but lose flood control. Arguments should use nutrient cycles, population limits, and biodiversity function rather than slogans alone.",
      checkQuestions: ["Define ecosystem services; give provisioning and regulating examples.", "Describe one provisioning vs regulating trade-off.", "How does carrying capacity thinking apply cautiously to humans?", "Why is intergenerational equity part of sustainability?"],
      pitfalls: ["Treating sustainability as recycling only."]
    }
  ],
  landmarks: [
    { title: "Niche concepts in ecology", authors: "G. E. Hutchinson", year: 1957, significance: "Formalised niche ideas used throughout ecology." }
  ],
} as ScienceField;

export default field;
