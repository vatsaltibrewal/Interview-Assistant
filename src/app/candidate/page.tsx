'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/lib/store';
import { setParsed, setReady, reset as resetCandidate } from '@/lib/slices/candidateSlice';
import { setQuestions, reset as resetInterview } from '@/lib/slices/interviewSlice';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DetailRequiredToast } from '@/components/toast';
import { extractPdfText } from '@/lib/parse/pdf';
import * as mammoth from 'mammoth';
import isEmail from 'validator/lib/isEmail';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export default function CandidatePage() {
  const router = useRouter();
  const search = useSearchParams();
  const dispatch = useDispatch();
  const interview = useSelector((s: RootState) => s.interview);
  const parsed = useSelector((s: RootState) => s.candidate.parsed);

  // -------- Route Guard on /candidate ----------
  React.useEffect(() => {
    if (interview.status === 'running' || interview.status === 'paused') {
      router.replace('/candidate/test');
    }
  }, [interview.status, router]);

  // Finished-state blocking dialog
  const [showFinishedDialog, setShowFinishedDialog] = React.useState(false);
  React.useEffect(() => {
    if (interview.status === 'finished') setShowFinishedDialog(true);
  }, [interview.status]);

  // local form for profile
  const [form, setForm] = React.useState({
    name: parsed?.name ?? '',
    email: parsed?.email ?? '',
    phone: parsed?.phone ?? '',
  });

  React.useEffect(() => {
    if (parsed) {
      setForm({ name: parsed.name, email: parsed.email, phone: parsed.phone });
    }
  }, [parsed]);

  // AI-driven extraction after file->text
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setErr(null); setBusy(true);

    try {
      const buf = await f.arrayBuffer();
      const ext = f.name.toLowerCase().split('.').pop();
      let text = '';

      if (f.type === 'application/pdf' || ext === 'pdf') {
        text = await extractPdfText(buf);
      } else if (f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === 'docx') {
        const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
        text = value || '';
      } else {
        throw new Error('Please upload a PDF or DOCX file.');
      }

      // server-side AI extraction (structured)
      const r = await fetch('/api/candidate/extract', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ resumeText: text }),
      });
      if (!r.ok) throw new Error('AI extraction failed.');
      const profile = await r.json() as { name: string; email: string; phone: string };

      // @ts-ignore
      dispatch(setParsed({ ...profile, rawText: text }));
      setForm({ name: profile.name || '', email: profile.email || '', phone: profile.phone || '' });
    } catch (e: any) {
      setErr(e?.message || 'Failed to parse resume.');
    } finally {
      setBusy(false);
    }
  }

  function validateForm() {
    if (!form.name || form.name.trim().length < 2) throw new Error('Enter a valid name.');
    if (!form.email || !isEmail(form.email)) throw new Error('Enter a valid email.');
    const p = parsePhoneNumberFromString(form.phone || '');
    if (!p || !p.isValid()) throw new Error('Enter a valid phone.');
  }

  // ---- Blocking loading dialog while generating questions ----
  const [genOpen, setGenOpen] = React.useState(false);
  const [genReady, setGenReady] = React.useState(false);
  const [genError, setGenError] = React.useState<string | null>(null);

  async function onContinue() {
    try {
      setErr(null);
      validateForm();
      if (!parsed) throw new Error('Resume not loaded yet.');

      // @ts-ignore
      dispatch(setParsed({ ...parsed, ...form }));

      setGenOpen(true);
      setGenError(null);
      setGenReady(false);

      const r = await fetch('/api/interview/questions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ resumeText: parsed.rawText }),
      });
      if (!r.ok) throw new Error('Failed to generate interview.');
      const { items } = await r.json();

      // @ts-ignore
      dispatch(setQuestions({ items }));

      await fetch('/api/ready', { method: 'POST' });
      // @ts-ignore
      dispatch(setReady(true));

      setGenReady(true);
    } catch (e: any) {
      setGenError(e?.message || 'Something went wrong.');
    }
  }

  function onGenContinue() {
    setGenOpen(false);
    router.push('/candidate/test');
  }

  async function onResetFinished() {
    // @ts-ignore
    dispatch(resetInterview());
    // @ts-ignore
    dispatch(resetCandidate());
    await fetch('/api/ready/clear', { method: 'POST' });
    setShowFinishedDialog(false);
    window.location.reload();
  }

  return (
    <main className="mx-auto min-h-svh max-w-3xl p-6 space-y-4 flex justify-center flex-col">
      <DetailRequiredToast
        show={search.get('detail') === 'required'}
        message="Please complete your details before starting the interview."
      />

      <Dialog open={showFinishedDialog}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Interview completed</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You've already finished this interview.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={onResetFinished}>Reset interview</Button>
            <Button className="bg-primary text-primary-foreground" onClick={() => router.replace('/candidate/result')}>
              View result
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <h1 className="text-2xl md:text-3xl font-semibold">Candidate Details</h1>

      <Card className="p-6 bg-card text-card-foreground border-border rounded-xl space-y-4">
        <input
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={onFile}
          className="block w-full text-sm file:mr-4 file:rounded-xl file:border file:border-border file:bg-secondary file:px-3 file:py-2"
        />
        {busy && <p className="text-sm text-muted-foreground">Parsing & extracting…</p>}
        {err && <p className="text-sm text-destructive">{err}</p>}

        {/* If we already have parsed state, preview it */}
        {(parsed || form.name || form.email || form.phone) && (
          <div className="rounded-xl border border-border p-4 space-y-3">
            <h3 className="font-medium">Your details (preview / editable)</h3>
            <input
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Full name"
              className="w-full rounded-xl border border-border bg-background p-2"
            />
            <input
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="Email"
              className="w-full rounded-xl border border-border bg-background p-2"
            />
            <input
              value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="Phone (with country code)"
              className="w-full rounded-xl border border-border bg-background p-2"
            />
          </div>
        )}

        <div className="flex gap-2 justify-center">
          <Button className="bg-primary text-primary-foreground" onClick={onContinue}>
            Continue
          </Button>
        </div>
      </Card>

      {/* Blocking “generating interview” dialog */}
      <Dialog open={genOpen}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="max-w-sm"
        >
          <DialogHeader>
            <DialogTitle>Status…</DialogTitle>
          </DialogHeader>

          {!genReady && !genError && (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">Preparing Your Interview Questions. Do not reload or close this page.</p>
            </div>
          )}

          {genError && <p className="text-sm text-destructive">{genError}</p>}

          {genReady && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Your interview is ready.</p>
              <DialogFooter className="mt-2">
                <Button className="bg-primary text-primary-foreground" onClick={onGenContinue}>
                  Start interview
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
