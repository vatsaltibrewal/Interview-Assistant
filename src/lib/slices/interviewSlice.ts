import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Difficulty = 'easy'|'medium'|'hard';
export const SCHEDULE: Difficulty[] = ['easy','easy','medium','medium','hard','hard'];
export const TIMER: Record<Difficulty, number> = { easy: 20_000, medium: 60_000, hard: 120_000 };

export type QA = { q: string; a: string; difficulty: Difficulty; timerMs: number };

type Result = {
  total: number;
  perQuestion: { index: number; difficulty: Difficulty; score: number; notes: string }[];
  summary: string;
  recommendation: 'reject'|'consider'|'strong-consider'|'hire';
} | null;

export type InterviewState = {
  qas: QA[];           // 6 pre-generated questions with timers
  current: number;     // current index
  remainingMs: number; // countdown for current
  status: 'idle'|'running'|'finished';
  result: Result;
};

const initialState: InterviewState = {
  qas: [],
  current: 0,
  remainingMs: 0,
  status: 'idle',
  result: null,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setQuestions(state, a: PayloadAction<{ items: { question: string; difficulty: Difficulty }[] }>) {
      state.qas = a.payload.items.map((it) => ({
        q: it.question,
        difficulty: it.difficulty,
        timerMs: TIMER[it.difficulty],
        a: '',
      }));
      state.current = 0;
      state.remainingMs = state.qas[0]?.timerMs ?? 0;
      state.status = 'idle';
      state.result = null;
    },
    start(state) {
      if (state.qas.length === 6) state.status = 'running';
    },
    setAnswer(state, a: PayloadAction<{ index: number; text: string }>) {
      if (state.qas[a.payload.index]) state.qas[a.payload.index].a = a.payload.text;
    },
    tick(state, a: PayloadAction<number>) {
      if (state.status !== 'running') return;
      state.remainingMs = Math.max(0, state.remainingMs - a.payload);
    },
    next(state) {
      if (state.current < state.qas.length - 1) {
        state.current += 1;
        state.remainingMs = state.qas[state.current].timerMs;
      } else {
        state.status = 'finished';
      }
    },
    finish(state) { state.status = 'finished'; },
    setResult(state, a: PayloadAction<NonNullable<Result>>) { state.result = a.payload; },
    reset() { return initialState; },
  },
});

export const { setQuestions, start, setAnswer, tick, next, finish, setResult, reset } = interviewSlice.actions;
export default interviewSlice.reducer;
