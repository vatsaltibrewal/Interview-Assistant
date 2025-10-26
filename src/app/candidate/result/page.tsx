'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Card } from '@/components/ui/card';
import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function ResultPage() {
  const st = useSelector((s: RootState) => s.interview);
  const router = useRouter();
  const status = useSelector((s: RootState) => s.interview.status);
  const parsed = useSelector((s: RootState) => s.candidate.parsed);

  React.useEffect(() => {
    if (status === 'idle') {
      router.replace('/candidate?detail=required');
    } else if (status === 'running' || status === 'paused') {
      router.replace('/candidate/test');
    }
  }, [status, router]);

  if (!st.result) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <Card className="p-6 bg-card border-border rounded-xl">
          <p className="text-sm text-muted-foreground">No result available yet.</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-svh max-w-3xl p-6 space-y-4 flex justify-center flex-col">
      <h1 className="text-2xl font-semibold">Your Result</h1>
      <Card className="p-6 bg-card border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{parsed?.name}</p>
            <h2 className="text-xl font-semibold">Score: {st.result.total}/100</h2>
          </div>
          <span className="rounded-xl bg-secondary px-3 py-1 text-sm border border-border">AI Recommendation: {st.result.recommendation}</span>
        </div>
        <p className="text-sm">{st.result.summary}</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {st.result.perQuestion.map((r, i) => (
            <div key={i} className="rounded-lg border border-border p-3">
              <p className="text-sm font-medium">
                Q{i + 1} · {r.difficulty.toUpperCase()} — {r.score}/10
              </p>
              <p className="text-sm text-muted-foreground">{r.notes}</p>
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
