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
    const ideas = concept.keyIdeas?.length
      ? concept.keyIdeas
      : [
          `Core definition of ${title}`,
          `Main mechanism behind ${title}`,
          `Evidence used to support claims about ${title}`,
        ];
    const questions: QuizQuestion[] = ideas.slice(0, 5).map((idea, i) => {
      const correct = idea.slice(0, 160);
      const distractors = [
        `A claim that confuses ${title} with an unrelated process.`,
        `An overstated rule that ignores limits of ${title}.`,
        `A description that reverses cause and effect for ${title}.`,
      ];
      const ordered = [correct, distractors[0], distractors[1], distractors[2]];
      return {
        id: `q${i + 1}`,
        prompt: `Which statement best matches established science about ${title}?`,
        choices: ordered,
        answerIndex: 0,
        explanation: `Focus on mechanisms and evidence for ${title} in ${field.name}. Key idea: ${idea}`,
      };
    });
    questions.unshift({
      id: "q0",
      prompt: `What is the main focus of the topic “${title}”?`,
      choices: [
        concept.whyItMatters?.slice(0, 140) || `Understanding ${title} in ${field.name}`,
        `Only memorising labels without mechanisms`,
        `Ignoring evidence and measurement`,
        `Treating ${title} as unrelated to ${field.name}`,
      ],
      answerIndex: 0,
      explanation: concept.whyItMatters || `This topic sits in ${field.name}.`,
    });
    return { title: `Quiz · ${title}`, questions: questions.slice(0, 6) };
  });
