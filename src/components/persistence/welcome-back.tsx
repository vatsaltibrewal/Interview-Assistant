'use client';

import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resume, reset as resetInterview } from '@/lib/slices/interviewSlice';
import { reset as resetCandidate } from '@/lib/slices/candidateSlice';
import type { RootState } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function WelcomeBackGate() {
  const dispatch = useDispatch();
  const candidate = useSelector((s: RootState) => s.candidate);
  const itv = useSelector((s: RootState) => s.interview);

  const show = useMemo(() => {
    const paused = itv.status === 'paused';
    const hasProgress = itv.qas.length === 6 && itv.remainingMs > 0;
    return candidate.ready && paused && hasProgress;
  }, [candidate.ready, itv.qas.length, itv.remainingMs, itv.status]);

  if (!show) return null;

  const mm = Math.floor(itv.remainingMs / 60000);
  const ss = Math.floor((itv.remainingMs % 60000) / 1000);

  async function onDiscard() {
    dispatch(resetInterview());
    dispatch(resetCandidate());
    await fetch('/api/ready/clear', { method: 'POST' });
    window.location.href = '/candidate';
  }

  function onResume() {
    dispatch(resume());
    window.location.href = '/candidate/test';
  }

  return (
    <Dialog open>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome back</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          You paused an interview at question {itv.current + 1} with {mm}:{ss.toString().padStart(2,'0')} remaining.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onDiscard}>Discard</Button>
          <Button className="bg-primary text-primary-foreground" onClick={onResume}>Resume</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
