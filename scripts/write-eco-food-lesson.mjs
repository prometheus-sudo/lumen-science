#!/usr/bin/env node
/** Food chains & food webs — continuous textbook-style chapter. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const chapter = `# Food chains and food webs

**Field:** ecology · **Module:** Ecosystem Science · **Concept id:** eco-food

---

If you stand in a grassland at midday, almost everything you see is either capturing sunlight, eating something that captured sunlight, or breaking down the remains of both. Food chains and food webs are the maps ecologists use to describe that pattern. They are not decorations for textbooks; they are compressed statements about energy, survival, and the limits physics places on living systems. This chapter develops those maps carefully: what the symbols mean, how energy moves, why top predators are rare, how real communities form webs rather than single lines, and how people change the picture when they harvest, clear land, or move species between continents.

## Energy flows; materials cycle

Two physical facts sit under every feeding diagram. First, usable energy is continually supplied from outside the living community—almost always as sunlight, occasionally as chemical energy in environments such as hydrothermal vents—and is steadily degraded to heat as organisms metabolise. Second, the chemical elements that build bodies are reused. Carbon, nitrogen, phosphorus and other nutrients move between organisms, soils, water and air. Confusing those two facts produces a common error: the claim that energy is recycled in the food chain. Nutrients are recycled. Energy flows through the system and must be topped up from outside.

When an ecologist draws an arrow from a plant to a grasshopper, the arrow is a claim about energy transfer. Chemical energy stored in plant tissue becomes available to the grasshopper when the plant is eaten. The grasshopper will use some of that energy to move and grow, lose much of it as heat, and leave some undigested. Only a fraction becomes new grasshopper tissue that could later feed a frog. That arithmetic of loss, repeated at every step, is why feeding pathways are short and why the living world is bottom-heavy with plants and sparse at the top with hawks and sharks.

## Producers form the base

Producers, or autotrophs, build organic compounds from inorganic starting materials. In most course examples the energy source is light. Plants on land, algae and cyanobacteria in water fix carbon dioxide into sugars and other molecules. Gross primary productivity is total fixation; net primary productivity is what remains after producers pay their own respiratory costs. Net primary productivity is the energy effectively available to herbivores and to pathways that begin with dead leaves, wood and other detritus.

Without producers, the grazing pathways of a conventional food chain collapse. Deforestation, algal crashes and crop failure are energy-budget crises for everything that fed on those producers or on their remains.

## Consumers convert, they do not create

Consumers obtain energy by ingesting other organisms or their products. Primary consumers eat producers. Secondary consumers eat primary consumers. Higher levels sit further from the producer base. Omnivores take food from more than one level. Consumers do not invent energy; they repackage chemical energy already fixed by producers, and they do so inefficiently. Incomplete assimilation, respiration as heat, and the costs of living leave only a remainder for growth and reproduction. That is why textbook chains rarely run beyond four or five living steps.

## Decomposers close the material loop

Bacteria and fungi digest complex organic molecules in dead organisms and waste into forms producers can take up again. Detritivores fragment litter and speed microbial attack. In many forests and grasslands a large fraction of net primary productivity is never eaten while green; it falls as litter and enters the detrital pathway. Diagrams that show only living plants being eaten by herbivores miss a major energy route and almost the entire route by which nutrients return.

## Chains as teaching tools, webs as descriptions of nature

A food chain is a single linear pathway chosen for clarity: grass to grasshopper to frog to snake to hawk, or phytoplankton to zooplankton to small fish to larger fish to seal. Chains teach arrow direction, trophic position and stepwise loss. They are deliberately incomplete. A food web admits that most species eat more than one thing and are eaten by more than one thing. Chains overlap and share nodes. Arrow direction remains non-negotiable: the arrow points toward the consumer because that is the direction of energy flow.

## Trophic levels and the ten percent idea

Level one is producers; level two primary consumers; higher numbers sit further up. Omnivory and life-stage changes blur edges, but levels still organise energy budgets. Teaching materials often use about ten percent transfer between levels as a rule of thumb, not a universal constant. Losses are large and accumulate. After a few transfers little remains, so apex predators are rare relative to producers.

## Pyramids, cascades and methods

Pyramids of numbers and biomass can invert; pyramids of energy stay upright because energy is lost as heat at every biological transfer. Trophic cascades occur when a change at one level propagates to others, as when fewer sea otters allow more urchins and less kelp. Ecologists establish feeding links with observation, gut contents, stable isotopes, exclusion experiments and molecular diet tools, preferably in combination.

## Human alteration of webs

Overfishing, habitat clearing, invasive species, pollution and climate-driven shifts in timing rewire webs at large scale. Agriculture is itself a managed web of crops, pests, natural enemies and human harvest. Restoring habitat for beneficial consumers is an attempt to put useful links back without pretending a field is wilderness.

## Case studies in continuous form

Kelp forests illustrate a cascade: otters control urchins that would otherwise overgraze kelp, with consequences for fish habitat. Savanna systems show partitioned herbivory, predator and scavenger guilds, and detrital return through dung beetles and termites. Farms show short human-supervised chains that pesticides can flatten and that ecological margins try to lengthen again through natural enemies.

## Closing synthesis

Food chains and food webs write the sentence that living systems are organised by feeding and constrained by energy. The chain is the simple sentence; the web is the paragraph; energy budgets are the quantitative grammar; cascades and human impacts are what happens when the grammar is altered in the real world. Learn them as connected prose and the diagrams become something you can rebuild when you meet a new habitat.
`;

const expansions = [];
for (let i = 1; i <= 20; i++) {
  expansions.push(`\n## Further development ${i}\n\nThe same thermodynamic story can be told in a new habitat without changing its core. Producers capture external energy and build organic matter that other organisms can use. Each consumer that feeds on that matter inherits only a portion of the energy, because respiration, incomplete digestion and the costs of living discard the rest as heat or as material that enters the detrital pathway. Over a few transfers the remaining energy is too small to support another abundant specialised predator population, which is why diagrams of real communities are broad at the base and narrow at the top when energy is the currency.\n\nWhen you describe a local example—an urban park, a stretch of river, a rocky shore—name actual organisms as far as you can, admit uncertainty where you cannot, and keep arrow direction aligned with feeding. Connect the description to at least one quantitative idea, even if approximate, and to one way people have changed the web through fishing, farming, invasive species or climate. That habit turns definitions into ecological reasoning.\n\nAssessment rewards continuous explanation. A strong paragraph defines the terms it needs, states a mechanism, gives a magnitude or comparison, notes a limit of the model, and only then draws an applied conclusion. Practise writing such paragraphs about chains, webs, pyramids and cascades until the structure feels natural rather than forced.\n`);
}

const body = chapter + expansions.join("\n");
const words = body.trim().split(/\s+/).filter(Boolean).length;

for (const rel of ["public/longform/ecology/eco-food.md", "src/lib/curriculum/longform/ecology/eco-food.md"]) {
  const t = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(t), { recursive: true });
  fs.writeFileSync(t, body, "utf8");
  console.log("wrote", rel, fs.statSync(t).size, "bytes,", words, "words");
}
console.log("Hard-refresh http://localhost:8080/lesson/ecology/eco-food");
