import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CandidateParsed = { name: string; email: string; phone: string; rawText: string };

type State = {
  parsed?: CandidateParsed;
  ready: boolean; // set true only after missing fields are filled
};

const initial: State = { ready: false };

const slice = createSlice({
  name: "candidate",
  initialState: initial,
  reducers: {
    setParsed(s, a: PayloadAction<CandidateParsed | undefined>) { s.parsed = a.payload; },
    setReady(s, a: PayloadAction<boolean>) { s.ready = a.payload; },
    reset() { return initial; }
  }
});

export const { setParsed, setReady, reset } = slice.actions;
export default slice.reducer;
