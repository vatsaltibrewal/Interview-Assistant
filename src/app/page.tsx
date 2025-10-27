import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Swipe AI — Interview Assistant",
  description:
    "AI-powered timed interviews with resume parsing, dynamic questions, and a searchable dashboard.",
};

type Step = { title: string; blurb: string };

const candidateSteps: Step[] = [
  {
    title: "Upload Resume",
    blurb:
      "PDF/DOCX accepted. We extract name, email & phone with AI and let you confirm.",
  },
  {
    title: "Confirm Details",
    blurb:
      "Confirm details and get ready. Your interview will be recorded locally in-browser.",
  },
  {
    title: "Timed Interview",
    blurb:
      "Answer each question with a visible countdown: 20s · 60s · 120s. Auto-submit on timeout. Welcome Back on reconnects.",
  },
  {
    title: "Results",
    blurb:
      "Get a concise AI summary and final score when all 6 are done.",
  },
];

const adminSteps: Step[] = [
  {
    title: "Open Dashboard",
    blurb:
      "See all candidates sorted by score. Search and sort instantly.",
  },
  {
    title: "Inspect Details",
    blurb:
      "Open a candidate to view resume, every Q/A, per-question notes, and the summary.",
  },
  {
    title: "Export",
    blurb:
      "Download a candidate's JSON for sharing or review.",
  },
  {
    title: "Pick Next Steps",
    blurb:
      "Use the recommendation to shortlist or advance candidates.",
  },
];

function Flow({ title, steps, ctaHref, ctaLabel }: { title: string; steps: Step[]; ctaHref: string; ctaLabel: string }) {
  return (
    <Card className="bg-card text-card-foreground border-border rounded-2xl p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <Button asChild className="bg-primary text-primary-foreground">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </div>
      <ol className="mt-6 space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3 rounded-xl border border-border p-3">
            <div className="mt-1 h-6 w-6 shrink-0 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm">
              {i + 1}
            </div>
            <div>
              <p className="text-sm font-medium">{s.title}</p>
              <p className="text-sm text-muted-foreground">{s.blurb}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-[radial-gradient(1200px_600px_at_100%_-20%,hsl(var(--color-primary)/0.15),transparent)] p-8 md:p-12">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
            AI-Powered Interview Assistant
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Upload resume, run a timed 6-question interview (2E · 2M · 2H),
            and get an AI score + summary. Review everything in a searchable
            dashboard — all persisted locally.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild className="bg-primary text-primary-foreground">
              <Link href="/candidate" aria-label="Try Candidate flow">Try as Candidate</Link>
            </Button>
            <Button asChild variant="outline" className="border-border">
              <Link href="/dashboard" aria-label="Open Dashboard">Open Admin Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Flows */}
      <section className="grid gap-6 md:grid-cols-2">
        <Flow
          title="Candidate Flow"
          steps={candidateSteps}
          ctaHref="/candidate"
          ctaLabel="Start as Candidate"
        />
        <Flow
          title="Interviewer Flow"
          steps={adminSteps}
          ctaHref="/dashboard"
          ctaLabel="Open Admin Dashboard"
        />
      </section>

      {/* How it works */}
      <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-semibold">How it works (under the hood)</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card className="bg-background border-border p-4 rounded-xl">
            <p className="text-sm font-medium">Next.js App Router</p>
            <p className="text-sm text-muted-foreground">
              App-based routes for <code className="opacity-80">/candidate</code> and <code className="opacity-80">/dashboard</code>, plus Middleware/Proxy for gating the test until details are confirmed.
            </p>
          </Card>
          <Card className="bg-background border-border p-4 rounded-xl">
            <p className="text-sm font-medium">Vercel AI SDK + Google (Gemini)</p>
            <p className="text-sm text-muted-foreground">
              Server-only routes generate structured JSON via <code className="opacity-80">generateObject</code> — keys stay server-side.
            </p>
          </Card>
          <Card className="bg-background border-border p-4 rounded-xl">
            <p className="text-sm font-medium">Redux Toolkit + redux-persist (IndexedDB)</p>
            <p className="text-sm text-muted-foreground">
              Async, durable client storage via localForage keeps progress across refresh/close without blocking the UI. Uses IndexedDB under the hood (via localForage) for large, structured data.
            </p>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="rounded-2xl border border-border bg-card p-6 md:p-8 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg md:text-xl font-semibold">Ready to try it?</h3>
          <p className="text-sm text-muted-foreground">
            Candidate runs the timed interview; Dashboard shows results.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="bg-primary text-primary-foreground">
            <Link href="/candidate">Try as Candidate</Link>
          </Button>
          <Button asChild variant="outline" className="border-border">
            <Link href="/dashboard">Open Admin Dashboard</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
