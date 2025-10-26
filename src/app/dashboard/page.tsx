"use client";

import * as React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { DataTable } from "@/components/dashboard/data-table";
import { columns } from "@/components/dashboard/coloumns";
import { DetailDrawer } from "@/components/dashboard/detail-drawer";

export default function DashboardPage() {
  const items = useSelector((s: RootState) => s.roster.items);
  const [open, setOpen] = React.useState(false);
  const [currentId, setCurrentId] = React.useState<string | null>(null);

  const onView = (id: string) => { setCurrentId(id); setOpen(true); };
  const onExport = (id: string) => {
    const rec = items.find(x => x.id === id);
    if (!rec) return;
    const blob = new Blob([JSON.stringify(rec, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `candidate-${rec.profile.name.replace(/\s+/g,'_')}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const cols = React.useMemo(() => columns(onView, onExport), [] as any);
  const current = items.find(x => x.id === currentId);

  return (
    <main className="mx-auto min-h-svh max-w-6xl p-6 space-y-4 flex justify-center flex-col">
      <h1 className="text-2xl font-semibold">Candidates</h1>
      <DataTable data={items} columns={cols} placeholder="Search by name, email, decision…" />
      <DetailDrawer open={open} onOpenChange={setOpen} record={current!} />
    </main>
  );
}
