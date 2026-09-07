import { createServerFn } from "@tanstack/react-start";
import { levelGuide, regionGuide } from "@/lib/learner";
import { getConcept, getField } from "@/lib/sciences";
import { getTeacherLesson } from "@/lib/server/teacher-lessons";
import { loadProfile } from "@/lib/server/profile";
import { getSessionUser } from "@/lib/auth/verify.server";

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
};

function shuffleWithAnswer(
  choices: string[],
  correctIndex: number,
): { choices: string[]; answerIndex: number } {
  const pairs = choices.map((c, i) => ({ c, correct: i === correctIndex }));
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return {
    choices: pairs.map((p) => p.c),
    answerIndex: pairs.findIndex((p) => p.correct),
  };
}

function levelTone(level: string): { depth: string; stem: string } {
  switch (level) {
    case "curious":
      return { depth: "everyday language", stem: "In simple terms" };
    case "undergraduate":
      return { depth: "university intro precision", stem: "At undergraduate level" };
    case "researcher":
      return { depth: "methods and limits", stem: "With research-level care" };
    default:
      return { depth: "secondary-school science vocabulary", stem: "For secondary school" };
  }
}

export const generateTopicQuiz = createServerFn({ method: "GET" })
  .validator((input: { slug: string; conceptId: string }) => input)
  .handler(async ({ data }): Promise<{ title: string; questions: QuizQuestion[] }> => {
    const found = getConcept(data.slug, data.conceptId);
    const teacher = await getTeacherLesson({
      data: { fieldSlug: data.slug, conceptId: data.conceptId },
    }).catch(() => null);
    const field = found?.field ?? getField(data.slug);
    const concept = teacher ?? found?.concept;
    if (!field || !concept) {
      return { title: "Quiz", questions: [] };
    }

    let level = "student";
    let region = "north-america";
    try {
      const session = await getSessionUser();
      if (session?.id) {
        const profile = await loadProfile(session.id);
        level = profile.learningLevel;
        region = profile.region;
      }
    } catch {
      /* guest defaults */
    }

    const tone = levelTone(level);
    const rGuide = regionGuide(region);
    const lGuide = levelGuide(level);
    const title = concept.title;
    const fieldName = field.name;
    const ideas = concept.keyIdeas?.length
      ? concept.keyIdeas
      : [
          `Core definition of ${title}`,
          `Main mechanism behind ${title}`,
          `Evidence used to support claims about ${title}`,
          `Limits of simple models of ${title}`,
          `How ${title} connects to neighbouring topics in ${fieldName}`,
        ];

    const expanded = [...ideas];
    while (expanded.length < 10) {
      expanded.push(
        [
          `Typical measurements or observations used for ${title}`,
          `Common misconceptions about ${title}`,
          `How energy, matter, or information flows in ${title}`,
          `A real-world setting where ${title} matters`,
          `What would falsify a careless claim about ${title}`,
        ][expanded.length % 5],
      );
    }

    const questions: QuizQuestion[] = [];
    let qn = 0;

    const push = (prompt: string, correct: string, wrong: string[], explanation: string) => {
      const base = [correct, ...wrong].slice(0, 4);
      while (base.length < 4) base.push(`An unrelated claim about ${fieldName}`);
      const { choices, answerIndex } = shuffleWithAnswer(base, 0);
      questions.push({
        id: `q${qn++}`,
        prompt,
        choices,
        answerIndex,
        explanation,
      });
    };

    push(
      `${tone.stem}, what is the main focus of \u201c${title}\u201d?`,
      concept.whyItMatters?.slice(0, 150) || `Understanding ${title} within ${fieldName}`,
      [
        `Only memorising labels without mechanisms for ${title}`,
        `Ignoring evidence related to ${title}`,
        `Treating ${title} as unrelated to ${fieldName}`,
      ],
      concept.whyItMatters || `Topic in ${fieldName}. (${tone.depth})`,
    );

    for (const idea of expanded.slice(0, 8)) {
      push(
        `Which statement best matches established science about ${title}?`,
        idea.slice(0, 180),
        [
          `A claim that confuses ${title} with an unrelated process.`,
          `An overstated rule that ignores limits of ${title}.`,
          `A description that reverses cause and effect for ${title}.`,
        ],
        `Key idea (${tone.depth}): ${idea}`,
      );
    }

    push(
      `Which approach fits your learning focus (${tone.depth}) for ${title}?`,
      lGuide.slice(0, 160),
      [
        `Skip all definitions and only memorise names for ${title}`,
        `Ignore regional context and units entirely for ${title}`,
        `Treat every popular claim about ${title} as proven fact`,
      ],
      `Level guidance: ${lGuide}`,
    );

    push(
      `When applying ${title} with regional context in mind, which is most appropriate?`,
      `Use examples and units that fit the learner\u2019s region: ${rGuide.slice(0, 120)}`,
      [
        `Always force non-SI units regardless of setting`,
        `Never mention local environment or infrastructure`,
        `Assume every region has identical lab equipment and climate`,
      ],
      `Region guidance: ${rGuide}`,
    );

    push(
      `What is a careful next step after studying ${title}?`,
      `Check definitions against evidence, then try a worked example or observation related to ${title}`,
      [
        `Post unverified claims about ${title} without checking sources`,
        `Ignore contradictions between ${title} and measurement`,
        `Stop at vocabulary lists with no mechanisms`,
      ],
      `Practice and evidence keep learning about ${title} honest.`,
    );

    return {
      title: `Quiz \u00b7 ${title}`,
      questions: questions.slice(0, 12),
    };
  });
