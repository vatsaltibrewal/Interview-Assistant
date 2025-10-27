'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { start, setAnswer, tick, next, finish, setResult } from '@/lib/slices/interviewSlice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { addCandidate } from '@/lib/slices/rosterSlice';
import { v4 as uuid } from 'uuid';
import { setReady } from '@/lib/slices/candidateSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function TestPage() {
  const dispatch = useDispatch();
  const st = useSelector((s: RootState) => s.interview);
  const parsed = useSelector((s: RootState) => s.candidate.parsed);

  const [dialogMode, setDialogMode] = React.useState<'closed' | 'confirm' | 'loading' | 'success' | 'error'>('closed');
  const [dialogError, setDialogError] = React.useState<string>('');
  const processedRef = React.useRef(false);

  // start interview on mount (if questions exist & idle)
  React.useEffect(() => {
    if (st.qas.length === 6 && st.status === 'idle') (dispatch as any)(start());
  }, [dispatch, st.qas.length, st.status]);

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

  React.useEffect(() => {
    const finalize = async () => {
      if (processedRef.current) return;
      processedRef.current = true;
      setDialogError('');
      setDialogMode('loading');

      try {
        if (!parsed?.rawText) throw new Error('Missing resume text.');

        const payload = {
          resumeText: parsed.rawText,
          qas: st.qas.map(({ q, a, difficulty }) => ({ q, a: a ?? '', difficulty })),
        };
        const res = await fetch('/api/interview/score', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Scoring failed.');
        const scored = await res.json();

        // Persist to roster
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

        // Clear the ready cookie and flip candidate.ready=false so middleware will block /candidate/test next time
        await fetch('/api/ready/clear', { method: 'POST' });
        (dispatch as any)(setReady(false));

        setDialogMode('success');
      } catch (err: any) {
        setDialogError(err?.message || 'Something went wrong.');
        setDialogMode('error');
      }
    };

    if (st.status === 'finished') {
      // If user hit Submit (confirm) or finished due to timer on last question, finalize once.
      finalize();
    }
  }, [dispatch, parsed, st.qas, st.status]);


  const openConfirm = () => setDialogMode('confirm');
  const closeDialog = () => setDialogMode('closed');

  // On confirm, we just trigger finish(); the effect above will handle finalize() and dialog states
  const confirmSubmit = async () => {
    setDialogMode('loading');
    (dispatch as any)(finish());
  };

  const goResult = () => {
    window.location.href = '/candidate/result';
  };

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

  const isDialogOpen = dialogMode !== 'closed';

  return (
    <main className="mx-auto min-h-svh max-w-3xl p-6 space-y-4 flex justify-center flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Interview</h1>
        <span className="text-sm px-3 py-1 rounded-xl bg-secondary border border-border">
          {mm}:{ss.toString().padStart(2, '0')}
        </span>
      </div>

      <Card className="p-6 bg-card border-border rounded-xl space-y-4">
        <p className="font-medium">{qa.q}</p>
        <textarea
          key={st.current}
          className="mt-2 min-h-32 w-full rounded-xl border border-border bg-background p-3"
          placeholder="Type your answer..."
          value={answerValue}
          onChange={(e) => (dispatch as any)(setAnswer({ index: st.current, text: e.target.value }))}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={openConfirm}>
            Submit Interview
          </Button>
          {st.current < st.qas.length - 1 && (
            <Button className="bg-primary text-primary-foreground" onClick={() => (dispatch as any)(next())}>
              Next
            </Button>
          )}
        </div>
      </Card>

      {/* Submit Confirmation / Loading / Success / Error Dialog */}
      <Dialog open={isDialogOpen}>
        <DialogContent className="sm:max-w-md" onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
          {dialogMode === 'confirm' && (
            <>
              <DialogHeader>
                <DialogTitle>Submit interview?</DialogTitle>
                <DialogDescription>
                  Once submitted, your answers will be scored and you'll see the result summary.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button className="bg-primary text-primary-foreground" onClick={confirmSubmit}>
                  Yes, submit
                </Button>
              </DialogFooter>
            </>
          )}

          {dialogMode === 'loading' && (
            <>
              <DialogHeader>
                <DialogTitle>Scoring your responses…</DialogTitle>
                <DialogDescription>This usually takes a few seconds.</DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-3 py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-transparent" />
                <p className="text-sm text-muted-foreground">Please wait…</p>
              </div>
            </>
          )}

          {dialogMode === 'success' && (
            <>
              <DialogHeader>
                <DialogTitle>Score ready</DialogTitle>
                <DialogDescription>Your result is prepared.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button className="bg-primary text-primary-foreground" onClick={goResult}>
                  View result
                </Button>
              </DialogFooter>
            </>
          )}

          {dialogMode === 'error' && (
            <>
              <DialogHeader>
                <DialogTitle>Something went wrong</DialogTitle>
                <DialogDescription className="text-destructive">{dialogError}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
