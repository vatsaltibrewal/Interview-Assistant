import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <section className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Swipe AI — Green Mist
        </h1>

        <Card className="bg-card text-card-foreground border-border p-6 rounded-xl">
          <p className="text-sm opacity-90">
            Phase 0 scaffold is ready. Tailwind v4 tokens + shadcn variables + Redux persisted store.
          </p>
          <div className="mt-4 flex gap-3">
            <Button className="bg-primary text-primary-foreground hover:opacity-90">
              Primary
            </Button>
            <Button variant="outline" className="border-border">
              Outline
            </Button>
          </div>
        </Card>
      </section>
    </main>
  );
}
