"use client";

import { CandidateRecord } from "@/lib/slices/rosterSlice";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function DetailDrawer({ open, onOpenChange, record }: {
  open: boolean; onOpenChange: (v: boolean) => void; record?: CandidateRecord;
}) {
  if (!record) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Candidate — {record.profile.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <section className="rounded-xl border border-border p-4">
            <p className="text-sm">Email: {record.profile.email}</p>
            <p className="text-sm">Phone: {record.profile.phone}</p>
            <p className="text-sm">Score: <span className="font-medium">{record.score}</span></p>
            <p className="text-sm">Recommendation: {record.recommendation}</p>
          </section>

          <section className="rounded-xl border border-border p-4">
            <h3 className="font-medium mb-2">Summary</h3>
            <p className="text-sm">{record.summary}</p>
          </section>

          <section className="rounded-xl border border-border p-4">
            <h3 className="font-medium mb-2">Questions & Answers</h3>
            <div className="space-y-3">
              {record.qas.map((x, i) => (
                <div key={i} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-medium">Q{i+1} · {x.difficulty.toUpperCase()} {typeof x.score==="number" ? `— ${x.score}/10` : ""}</p>
                  <p className="text-sm">Q: {x.q}</p>
                  <p className="text-sm">A: {x.a || "(no answer)"}</p>
                  {x.notes && <p className="text-xs text-muted-foreground mt-1">Notes: {x.notes}</p>}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border p-4">
            <h3 className="font-medium mb-2">Resume (extracted)</h3>
            <pre className="text-xs whitespace-pre-wrap">{record.resumeText}</pre>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
