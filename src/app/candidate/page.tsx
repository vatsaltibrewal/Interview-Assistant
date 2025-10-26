'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { setParsed, setReady } from "@/lib/slices/candidateSlice";
import { setQuestions } from "@/lib/slices/interviewSlice";
import { extractPdfText } from "@/lib/parse/pdf";
import * as mammoth from "mammoth";
import isEmail from "validator/lib/isEmail";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { DetailRequiredToast } from "@/components/toast";

export default function CandidatePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const search = useSearchParams();
  const [ui, setUI] = useState<{ busy: boolean; error?: string }>({ busy: false });
  const parsed = useSelector((s: RootState) => s.candidate.parsed);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [hasProfile, setHasProfile] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setUI({ busy: true });

    try {
      // 1) read to text (pdf.js or mammoth)
      const buf = await f.arrayBuffer();
      const ext = f.name.toLowerCase().split(".").pop();
      let text = "";

      if (f.type === "application/pdf" || ext === "pdf") {
        text = await extractPdfText(buf);
      } else if (f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || ext === "docx") {
        const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
        text = value || "";
      } else {
        throw new Error("Please upload a PDF or DOCX file.");
      }

      // 2) ask AI to extract name/email/phone
      const r = await fetch("/api/candidate/extract", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ resumeText: text })
      });
      if (!r.ok) throw new Error("AI extraction failed");
      const p = await r.json() as { name: string; email: string; phone: string };

      // 3) update local form and redux parsed (rawText only for now)
      setForm({ name: p.name || "", email: p.email || "", phone: p.phone || "" });
      dispatch(setParsed({ name: p.name || "", email: p.email || "", phone: p.phone || "", rawText: text } as any));
      setHasProfile(true);
    } catch (err: any) {
      setUI({ busy: false, error: err?.message || "Failed to parse resume." });
      return;
    }
    setUI({ busy: false });
  }

  function validateForm() {
    if (!form.name || form.name.trim().length < 2) throw new Error("Enter a valid name.");
    if (!form.email || !isEmail(form.email)) throw new Error("Enter a valid email.");
    const p = parsePhoneNumberFromString(form.phone || ""); 
    if (!p || !p.isValid()) throw new Error("Enter a valid phone.");
  }

  async function onContinue() {
    try {
      validateForm();
      // merge confirmed form back into redux parsed
      let merged: any = { ...form };
      if (parsed) {
        merged = { ...parsed, ...form };
        // @ts-ignore
        dispatch(setParsed(merged));
      }
      // 1) batch-generate 6 questions on the server
      const r = await fetch('/api/interview/questions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ resumeText: merged.rawText }),
      });
      if (!r.ok) throw new Error('Failed to generate questions');
      const { items } = await r.json(); // [{ difficulty, question }, ...]

      // 2) store questions in Redux and mark ready
      // @ts-ignore
      dispatch(setQuestions({ items }));
      await fetch('/api/ready', { method: 'POST' });
      // @ts-ignore
      dispatch(setReady(true));

      // 3) route to test (middleware already allows now)
      router.push('/candidate/test');

    } catch (e: any) {
      setUI((u) => ({ ...u, error: e?.message || "Please correct the details." }));
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      {/* custom toast for ?detail=required */}
      <DetailRequiredToast show={search.get("detail") === "required"} message="Please complete your details before starting the interview." />

      <h1 className="text-2xl md:text-3xl font-semibold">Interview Setup</h1>

      <div className="rounded-xl border border-border bg-card text-card-foreground p-6 space-y-4">
        <input type="file" accept=".pdf,.docx" onChange={onFile}
          className="block w-full text-sm file:mr-4 file:rounded-xl file:border file:border-border file:bg-secondary file:px-3 file:py-2" />
        {ui.busy && <p className="text-sm text-muted-foreground">Parsing & extracting…</p>}
        {ui.error && <p className="text-sm text-destructive">{ui.error}</p>}

        {hasProfile && (
          <>
            <div className="grid gap-3">
              <input value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))}
                placeholder="Full name" className="w-full rounded-xl border border-border bg-background p-2" />
              <input value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))}
                placeholder="Email" className="w-full rounded-xl border border-border bg-background p-2" />
              <input value={form.phone} onChange={(e)=>setForm(f=>({...f,phone:e.target.value}))}
                placeholder="Phone (with country code)" className="w-full rounded-xl border border-border bg-background p-2" />
            </div>
            <div className="flex gap-2">
              <button onClick={onContinue} className="rounded-xl bg-primary px-4 py-2 text-primary-foreground">Continue</button>
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        PDF via pdf.js (<code>getTextContent()</code>) and DOCX via Mammoth; AI extraction via Vercel AI SDK + Google provider (structured output).
      </p>
    </main>
  );
}
