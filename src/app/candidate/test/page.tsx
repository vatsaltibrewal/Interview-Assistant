'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { start, setAnswer, tick, next, finish, setResult } from '@/lib/slices/interviewSlice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { addCandidate } from '@/lib/slices/rosterSlice';
import { v4 as uuid } from 'uuid';

export default function TestPage() {
  const dispatch = useDispatch();
  const st = useSelector((s: RootState) => s.interview);
  const parsed = useSelector((s: RootState) => s.candidate.parsed);

  // start interview on mount (if questions exist)
  React.useEffect(() => { if (st.qas.length === 6) (dispatch as any)(start()); }, [dispatch, st.qas.length]);

  // 1-second countdown tick
  React.useEffect(() => {
    if (st.status !== 'running') return;
    const id = setInterval(() => (dispatch as any)(tick(1000)), 1000);
    return () => clearInterval(id);
  }, [dispatch, st.status]);

  // autosubmit & advance when timer hits 0
  React.useEffect(() => {
    if (st.status === 'running' && st.remainingMs <= 0) {
      if (st.current < st.qas.length - 1) {
        (dispatch as any)(next());
      } else {
        (dispatch as any)(finish());
      }
    }
  }, [dispatch, st.status, st.remainingMs, st.current, st.qas.length]);

  // finish + score → go to result
  React.useEffect(() => {
    (async () => {
      if (st.status === 'finished' && parsed?.rawText) {
        const payload = {
          resumeText: parsed.rawText,
          qas: st.qas.map(({ q, a, difficulty }) => ({ q, a: a ?? '', difficulty })),
        };
        const res = await fetch('/api/interview/score', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const scored = await res.json();
          const record = {
            id: uuid(),
            createdAt: new Date().toISOString(),
            profile: { name: parsed!.name, email: parsed!.email, phone: parsed!.phone },
            score: scored.total,
            recommendation: scored.recommendation,
            summary: scored.summary,
            qas: st.qas.map((qa, i) => ({
              q: qa.q,
              a: qa.a || '',
              difficulty: qa.difficulty,
              score: scored.perQuestion[i]?.score,
              notes: scored.perQuestion[i]?.notes,
            })),
            resumeText: parsed!.rawText,
          };
          (dispatch as any)(addCandidate(record));
          (dispatch as any)(setResult(scored));
          window.location.href = '/candidate/result';
        }
      }
    })();
  }, [dispatch, st.status, parsed?.rawText, st.qas]);

  if (st.qas.length !== 6) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <Card className="p-6 bg-card border-border rounded-xl">
          <p className="text-sm text-muted-foreground">Preparing your interview…</p>
        </Card>
      </main>
    );
  }

  const qa = st.qas[st.current];
  const answerValue = qa.a ?? '';
  const mm = Math.floor(st.remainingMs / 60000);
  const ss = Math.floor((st.remainingMs % 60000) / 1000);

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Interview</h1>
        <span className="text-sm px-3 py-1 rounded-xl bg-secondary border border-border">
          {mm}:{ss.toString().padStart(2, '0')}
        </span>
      </div>

      <Card className="p-6 bg-card border-border rounded-xl space-y-4">
        <p className="font-medium">{qa.q}</p>
        <textarea
          key={st.current} // ensures caret resets per question
          className="mt-2 min-h-32 w-full rounded-xl border border-border bg-background p-3"
          placeholder="Type your answer..."
          value={answerValue}
          onChange={(e) => (dispatch as any)(setAnswer({ index: st.current, text: e.target.value }))}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => (dispatch as any)(finish())}>Submit Interview</Button>
          {st.current < st.qas.length - 1 && (
            <Button className="bg-primary text-primary-foreground" onClick={() => (dispatch as any)(next())}>
              Next
            </Button>
          )}
        </div>
      </Card>
    </main>
  );
}
