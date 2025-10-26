import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const ScoreItem = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']),
  score: z.number().int().min(0).max(10),
  notes: z.string().min(3).max(600),
});

const ScoreSchemaStrict = z.object({
  perQuestion: z.array(ScoreItem).length(6),
  summary: z.string().min(30).max(700),
  recommendation: z.enum(['reject','consider','strong-consider','hire']),
  total: z.number().int().min(0).max(100).optional(),
});

const ScoreSchemaLoose = z.object({
  perQuestion: z.array(z.object({
    index: z.number().int().min(0).max(10).optional(),
    difficulty: z.enum(['easy','medium','hard']),
    score: z.number().int().min(0).max(10),
    notes: z.string().min(3),
  })).min(6),
  summary: z.string().min(10),
  recommendation: z.enum(['reject','consider','strong-consider','hire']),
  total: z.number().int().optional(),
});

const WEIGHT = { easy: 10, medium: 15, hard: 25 } as const;
type Diff = keyof typeof WEIGHT;

function computeWeightedTotal(items: Array<{difficulty: Diff; score: number}>) {
  const total = items.reduce((sum, it) => sum + (it.score * WEIGHT[it.difficulty]) / 10, 0);
  return Math.round(total); // integer 0..100
}

export async function POST(req: Request) {
  const { resumeText, qas } = await req.json() as {
    resumeText: string;
    qas: { q: string; a: string; difficulty: Diff }[];
  };

  const system = `You are a precise technical interviewer for a Full-Stack (React/Node) role.
Evaluate 6 Q/A pairs. For each question, return {difficulty, score 0..10, notes}.
Then provide a concise summary and a recommendation. Do NOT include an index field. Return JSON only.`;

  const prompt = `Resume (trimmed):
"""${(resumeText ?? '').slice(0, 3000)}"""

Q/A:
${qas.map((x, i) => `#${i+1} [${x.difficulty.toUpperCase()}]
Q: ${x.q}
A: ${x.a || '(no answer)'}
`).join('\n')}`;

  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: ScoreSchemaStrict,
      system,
      prompt,
    });

    const perQuestion = object.perQuestion.slice(0, 6);
    const total = object.total ?? computeWeightedTotal(perQuestion);
    return NextResponse.json({ ...object, total, perQuestion });
  } catch (err: any) {
    const raw = err?.text as string | undefined;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const loose = ScoreSchemaLoose.parse(parsed);
        const perQuestion = loose.perQuestion.slice(0, 6).map(({ difficulty, score, notes }) =>
          ({ difficulty, score, notes })
        );
        const total = computeWeightedTotal(perQuestion);
        return NextResponse.json({
          perQuestion, summary: loose.summary, recommendation: loose.recommendation, total
        });
      } catch { /* fall through */ }
    }
    throw err;
  }
}
