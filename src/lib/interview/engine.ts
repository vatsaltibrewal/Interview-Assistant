import { AppDispatch } from "@/lib/store";
import { pushQuestion, SCHEDULE, start } from "@/lib/slices/interviewSlice";

export function startInterview(dispatch: AppDispatch) { dispatch(start()); }

export async function ensureQuestionForIndex(
  dispatch: AppDispatch,
  resumeText: string,
  i: number
) {
  while (true) {
    const res = await fetch('/api/interview/question', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ difficulty: SCHEDULE[i], resumeText }),
    });
    if (!res.ok) throw new Error('Failed to generate question');
    const { question } = await res.json();
    dispatch(pushQuestion({ q: question, difficulty: SCHEDULE[i] }));
    break;
  }
}
