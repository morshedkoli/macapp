import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ locked: true });
  res.cookies.delete("lock_unlocked");
  res.cookies.delete("lock_hardcore");
  return res;
}
