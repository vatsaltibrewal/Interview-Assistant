import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// 2 easy -> 2 medium -> 2 hard ; keep questions concise to match timers
const QuestionsSchema = z.object({
  items: z.array(
    z.object({
      difficulty: z.enum(['easy','medium','hard']),
      question: z.string().min(8),
    })
  ).length(6),
});

export async function POST(req: Request) {
  const { resumeText } = await req.json() as { resumeText: string };

  const system = `You are an expert interviewer for a Full-Stack (React/Node) role.
Generate exactly 6 concise questions in this order:
1-2 EASY (20s), 3-4 MEDIUM (60s), 5-6 HARD (120s).
Keep each question clear, specific, and answerable within the allotted time. Keep each question between 8 and 240 characters.
Return JSON: { "items": [ { "difficulty":"easy|medium|hard", "question":"..." }, ... ] }`;

  const prompt = `Candidate resume context (trimmed):
"""${(resumeText ?? '').slice(0, 4000)}"""`;

  const { object } = await generateObject({
    model: google('gemini-2.5-flash'),
    schema: QuestionsSchema,
    system,
    prompt,
  });

  // Enforce order on the server response if needed (safety):
  const order: Array<'easy'|'medium'|'hard'> = ['easy','easy','medium','medium','hard','hard'];
  const items = object.items.slice(0, 6).map((it, i) => ({
    difficulty: order[i],
    question: it.question,
  }));

  return NextResponse.json({ items });
}
