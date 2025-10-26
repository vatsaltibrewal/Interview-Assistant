"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CandidateRecord } from "@/lib/slices/rosterSlice";
import { Button } from "@/components/ui/button";

export type RowData = CandidateRecord;

export const columns = (onView: (id: string) => void, onExport: (id: string) => void): ColumnDef<RowData>[] => [
  {
    accessorKey: "profile.name",
    header: "Name",
    cell: ({ row }) => <span className="truncate">{row.original.profile.name}</span>,
  },
  {
    accessorKey: "score",
    header: "Score",
    sortingFn: "basic", // default numeric
    cell: ({ row }) => <span className="font-medium">{row.original.score}</span>,
  },
  {
    accessorKey: "recommendation",
    header: "Decision",
    cell: ({ row }) => <span className="rounded-lg bg-secondary px-2 py-1 border border-border text-xs">
      {row.original.recommendation}
    </span>,
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    sortingFn: "datetime",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onView(row.original.id)}>View</Button>
        <Button className="bg-primary text-primary-foreground" onClick={() => onExport(row.original.id)}>Export</Button>
      </div>
    ),
    enableSorting: false,
  },
];
