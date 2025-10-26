import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("swipe_ready", "1", { httpOnly: true, path: "/", maxAge: 2 * 60 * 60 }); //Short Lived Cookie
  return res;
}
