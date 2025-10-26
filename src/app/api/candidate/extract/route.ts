import { NextResponse } from "next/server";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";

const ProfileSchema = z.object({
  name: z.string().min(2).max(200).describe("Full name of the candidate"),
  email: z.string().email().describe("Primary email"),
  phone: z.string().max(40).describe("Phone number (with country code if present)"),
});

export async function POST(req: Request) {
  const { resumeText } = await req.json() as { resumeText: string };

  const system = `You are an expert recruiter. Extract the candidate's name, email, and phone from the resume text. 
Return ONLY JSON that matches the schema. If a field is not present, leave it empty but still include the key.`;

  const prompt = `Resume (trimmed to 4000 chars):
"""${(resumeText ?? "").slice(0, 4000)}"""`;

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: ProfileSchema,
    system,
    prompt,
  });

  const out = {
    name: object.name || "",
    email: object.email || "",
    phone: object.phone || "",
  };

  return NextResponse.json(out);
}
