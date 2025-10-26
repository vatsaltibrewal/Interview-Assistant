'use client';

import React from "react";

export function DetailRequiredToast({ show, message }: { show: boolean; message: string }) {
  const [open, setOpen] = React.useState(show);
  React.useEffect(() => setOpen(show), [show]);

  if (!open) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-border bg-card text-card-foreground shadow-lg">
      <div className="flex items-start gap-3 p-4">
        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
        <div className="flex-1">
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="rounded-md px-2 py-1 text-xs hover:bg-secondary"
          aria-label="Close"
        >
          Close
        </button>
      </div>
      <div className="h-1 w-full rounded-b-xl bg-primary/40">
        <div className="h-1 w-full animate-[toastbar_3s_linear_forwards] bg-primary" />
      </div>
      {/* Tailwind v4 inline keyframes */}
      <style jsx>{`
        @keyframes toastbar { from { width: 100% } to { width: 0% } }
      `}</style>
    </div>
  );
}
