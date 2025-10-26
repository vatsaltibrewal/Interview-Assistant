import { z } from 'zod';
import isEmail from 'validator/lib/isEmail';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const CandidateSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().refine(isEmail, 'Invalid email'),
  phone: z.string().refine((v) => {
    const p = parsePhoneNumberFromString(v || '');
    return !!p && p.isValid();
  }, 'Invalid phone'),
  rawText: z.string().min(10),
});

export type CandidateParsed = z.infer<typeof CandidateSchema>;

/** naive name heuristic from CV text */
export function guessName(text: string): string {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  // Often first non-empty line is the name if it doesn't contain '@' or digits
  return (lines.find((l) => !/@/.test(l) && !/\d{3,}/.test(l)) || '').slice(0, 120);
}

export function extractFields(text: string): Omit<CandidateParsed, 'rawText'> {
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  // Grab first plausible phone; libphonenumber-js will validate
  const phoneMatch = text.match(/(\+?\d[\d\s().-]{7,}\d)/)?.[1] || '';
  const name = guessName(text) || 'Candidate';

  return { name, email: emailMatch, phone: phoneMatch };
}
