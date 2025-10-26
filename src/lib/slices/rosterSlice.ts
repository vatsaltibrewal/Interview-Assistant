import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Difficulty = 'easy'|'medium'|'hard';

export type CandidateRecord = {
  id: string;                       // uuid
  createdAt: string;                // ISO
  profile: { name: string; email: string; phone: string };
  score: number;                    // 0..100
  recommendation: 'reject'|'consider'|'strong-consider'|'hire';
  summary: string;
  qas: { q: string; a: string; difficulty: Difficulty; score?: number; notes?: string }[];
  resumeText: string;
};

type RosterState = { items: CandidateRecord[] };

const initialState: RosterState = { items: [] };

const rosterSlice = createSlice({
  name: "roster",
  initialState,
  reducers: {
    addCandidate(s, a: PayloadAction<CandidateRecord>) {
      // if same id exists, replace; else insert
      const i = s.items.findIndex(x => x.id === a.payload.id);
      if (i >= 0) s.items[i] = a.payload; else s.items.unshift(a.payload);
      // keep sorted by score desc, then newest
      s.items.sort((a,b) => b.score - a.score || b.createdAt.localeCompare(a.createdAt));
    },
    removeCandidate(s, a: PayloadAction<string>) {
      s.items = s.items.filter(x => x.id !== a.payload);
    },
    clearAll(s) { s.items = []; }
  }
});

export const { addCandidate, removeCandidate, clearAll } = rosterSlice.actions;
export default rosterSlice.reducer;
