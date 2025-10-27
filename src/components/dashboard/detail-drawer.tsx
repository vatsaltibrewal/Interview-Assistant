"use client";

import { CandidateRecord } from "@/lib/slices/rosterSlice";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function DetailDrawer({
  open,
  onOpenChange,
  record,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  record?: CandidateRecord;
}) {
  if (!record) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-sm sm:max-w-3xl md:max-w-5xl lg:max-w-7xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Candidate — {record.profile.name}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[85svh] overflow-y-auto p-6 space-y-4">
          <section className="rounded-xl border border-border p-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <p className="text-sm">Email: {record.profile.email}</p>
              <p className="text-sm">Phone: {record.profile.phone}</p>
              <p className="text-sm">
                Score: <span className="font-medium">{record.score}</span>
              </p>
              <p className="text-sm">Recommendation: {record.recommendation}</p>
            </div>
          </section>

          <section className="rounded-xl border border-border p-4">
            <h3 className="mb-2 font-medium">Summary</h3>
            <p className="text-sm">{record.summary}</p>
          </section>

          <section className="rounded-xl border border-border p-4">
            <h3 className="mb-2 font-medium">Questions &amp; Answers</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {record.qas.map((x, i) => (
                <div key={i} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-medium">
                    Q{i + 1} · {x.difficulty.toUpperCase()}{" "}
                    {typeof x.score === "number" ? `— ${x.score}/10` : ""}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Q:</span> {x.q}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">A:</span> {x.a || "(no answer)"}
                  </p>
                  {x.notes && (
                    <p className="mt-1 text-xs text-muted-foreground">Notes: {x.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border p-4">
            <h3 className="mb-2 font-medium">Resume (extracted)</h3>
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap wrap-break-word text-xs">
              {record.resumeText}
            </pre>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
