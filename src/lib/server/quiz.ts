import { createServerFn } from "@tanstack/react-start";
import { getConcept, getField } from "@/lib/sciences";
import { getTeacherLesson } from "@/lib/server/teacher-lessons";

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
    const title = concept.title;
    const fieldName = field.name;
    const ideas = concept.keyIdeas?.length
      ? concept.keyIdeas
      : [
          `Core definition of ${title}`,
          `Main mechanism behind ${title}`,
          `Evidence used to support claims about ${title}`,
        ];

    const questions: QuizQuestion[] = [];

    {
      const base = [
        concept.whyItMatters?.slice(0, 140) || `Understanding ${title} within ${fieldName}`,
        `Only memorising labels without mechanisms for ${title}`,
        `Ignoring evidence and measurement related to ${title}`,
        `Treating ${title} as unrelated to ${fieldName}`,
      ];
      const { choices, answerIndex } = shuffleWithAnswer(base, 0);
      questions.push({
        id: "q0",
        prompt: `What is the main focus of the topic \u201c${title}\u201d?`,
        choices,
        answerIndex,
        explanation: concept.whyItMatters || `This topic sits in ${fieldName}.`,
      });
    }

    ideas.slice(0, 5).forEach((idea, i) => {
      const correct = idea.slice(0, 160);
      const base = [
        correct,
        `A claim that confuses ${title} with an unrelated process in ${fieldName}.`,
        `An overstated rule that ignores the limits of ${title}.`,
        `A description that reverses cause and effect for ${title}.`,
      ];
      const { choices, answerIndex } = shuffleWithAnswer(base, 0);
      questions.push({
        id: `q${i + 1}`,
        prompt: `Which statement best matches established science about ${title}?`,
        choices,
        answerIndex,
        explanation: `Focus on mechanisms and evidence for ${title} in ${fieldName}. Key idea: ${idea}`,
      });
    });

    return {
      title: `Quiz \u00b7 ${title}`,
      questions: questions.slice(0, 6),
    };
  });
