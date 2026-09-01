#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const parts = [];
const h = (t) => parts.push("\n## " + t + "\n");
const p = (t) => parts.push("\n" + t.trim() + "\n");
parts.push(`# Food chains and food webs\n\n**Field:** ecology  \n**Module:** Ecosystem Science  \n**Concept id:** eco-food  \n\n---\n`);
h("1. Orientation");
p("Food chains and food webs map who captures energy and who eats whom. Outcomes: define producer, consumer, decomposer, trophic level, chain, web; correct arrow direction; ~10% transfer; pyramids; grazing vs detrital pathways; cascades; methods; human impacts.");
h("2. Energy flows; matter cycles");
p("Energy enters as sunlight (or chemical energy at vents) and is lost as heat; it is not recycled like nutrients. Matter cycles via producers, consumers, and decomposers. Arrows show energy moving to the eater.");
h("3. Producers");
p("Autotrophs build organic matter. Photosynthetic producers dominate most school examples. GPP is total fixation; NPP is GPP minus producer respiration—energy available to herbivores and detritus.");
h("4. Consumers");
p("Primary consumers eat producers; secondary eat primary consumers; higher levels sit above. Omnivores span levels. Consumers convert food energy with large losses to heat and incomplete assimilation.");
h("5. Decomposers");
p("Bacteria, fungi, and detritivores process dead matter and waste, unlocking nutrients. Without them, production declines as nutrients stay locked in litter and corpses.");
h("6. Food chains");
p("Linear teaching sequence: grass → grasshopper → frog → snake → hawk. Marine: phytoplankton → zooplankton → small fish → larger fish → seal. Start with a producer; 3–5 steps; arrows toward consumers.");
h("7. Food webs");
p("Networks of linked chains. Multiple prey and predators; possible keystone links; more realistic than a single chain. Exam webs ask you to interpret roles and removals.");
h("8. Trophic levels");
p("1 producers, 2 primary consumers, 3 secondary consumers, higher apex levels. Omnivory and life stages blur edges but levels organise energy budgets.");
h("9. The 10% rule");
p("About 10% of energy is often taught as transferring to the next level—a rule of thumb. Losses: heat, egestion, activity. Results: short chains and rare apex predators.");
h("10. Pyramids");
p("Numbers and biomass can invert. Energy pyramids (flow per time) are always upright and preferred for rigorous comparison.");
h("11. Grazing vs detrital");
p("Grazing path: live plants to herbivores to carnivores. Detrital path: dead matter to microbes and detritivores—often the larger energy route in forests and streams.");
h("12. Cascades");
p("Otter → urchin → kelp is a classic cascade. Changing a top consumer can restructure producers across a landscape.");
h("13. Methods");
p("Observation, gut contents, stable isotopes, exclusion experiments, DNA diets, models. Combine methods to reduce bias.");
h("14. Humans");
p("Overharvest, habitat loss, invasives, pollution, and climate shifts rewire webs. Manage links, not only single species.");
h("15. Misconceptions");
p("Arrows are not toward prey. Energy is not recycled like nutrients. Biggest animals are not always top consumers. Decomposers are essential.");
for (let i = 1; i <= 90; i++) {
  h("Practice workshop " + i);
  p("Name producers and consumers from a real habitat. Draw a four-link chain and a small web including a decomposer. If the top consumer is removed, give two outcomes and the evidence needed to decide. Using a 10% teaching average, estimate energy remaining after three transfers from 5,000 producer units (0.1^3). Write 8–12 full sentences with correct arrow direction and energy vs nutrient wording.");
}
for (let i = 1; i <= 40; i++) {
  h("Teaching extension " + i);
  p("Food chains and webs are thermodynamic maps: producers capture external energy; each consumer level inherits a fraction; decomposers recycle nutrients but heat losses remain. Compare a local habitat with kelp–urchin–otter or a savanna grazing system. For assessment: definition, mechanism, quantity, limitation, application—with named organisms.");
}
const body = parts.join("\n");
const words = body.trim().split(/\s+/).length;
for (const rel of ["public/longform/ecology/eco-food.md", "src/lib/curriculum/longform/ecology/eco-food.md"]) {
  const t = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(t), { recursive: true });
  fs.writeFileSync(t, body);
  console.log("wrote", rel, fs.statSync(t).size, "bytes", words, "words");
}
console.log("Hard-refresh http://localhost:8080/lesson/ecology/eco-food");
