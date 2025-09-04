import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const pin = String(body?.pin ?? "").trim();
  const lockPin = process.env.LOCK_PIN;
  const hardcorePin = process.env.HARDCORE_PIN;

  if (!pin) {
    return Response.json({ error: "PIN is required" }, { status: 400 });
  }
  if (!lockPin && !hardcorePin) {
    return Response.json(
      { error: "Server PINs not configured. Set LOCK_PIN or HARDCORE_PIN." },
      { status: 500 }
    );
  }

  const usedHardcore = hardcorePin && pin === hardcorePin;
  const ok = (lockPin && pin === lockPin) || usedHardcore;

  if (!ok) {
    return Response.json({ error: "Invalid PIN" }, { status: 401 });
  }

  const res = NextResponse.json({ unlocked: true, hardcore: !!usedHardcore });
  res.cookies.set("lock_unlocked", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 4,
  });
  if (usedHardcore) {
    res.cookies.set("lock_hardcore", "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 4,
    });
  }
  return res;
}
