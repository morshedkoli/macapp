import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const unlocked = cookieStore.get("lock_unlocked")?.value === "1";
  const hardcore = cookieStore.get("lock_hardcore")?.value === "1";
  return Response.json({ unlocked, hardcore });
}
