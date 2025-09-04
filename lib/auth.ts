import { cookies } from "next/headers";

export async function isUnlocked() {
  const cookieStore = await cookies();
  const token = cookieStore.get("lock_unlocked")?.value;
  return token === "1";
}

export async function requireUnlocked() {
  const ok = await isUnlocked();
  if (!ok) {
    return new Response(JSON.stringify({ error: "Locked" }), { status: 401 });
  }
  return null;
}
