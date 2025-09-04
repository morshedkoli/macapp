import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import Record from "@/lib/models/Record";

async function ensureUnlocked() {
  const cookieStore = await cookies();
  const token = cookieStore.get("lock_unlocked")?.value;
  if (token !== "1") {
    return new Response(JSON.stringify({ error: "Locked" }), { status: 401 });
  }
  return null;
}

function normalizeMac(mac: string) {
  return mac.replace(/[^a-fA-F0-9]/g, "").toLowerCase();
}

function isValidMac(mac: string) {
  const n = normalizeMac(mac);
  return /^[a-f0-9]{12}$/.test(n);
}

function isValidPhone(phone: string) {
  const p = String(phone).trim();
  return p.length >= 6 && p.length <= 20;
}

export async function GET(req: NextRequest) {
  const lock = await ensureUnlocked();
  if (lock) return lock;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name")?.trim();
    const mac = searchParams.get("mac")?.trim();
    const phone = searchParams.get("phone")?.trim();

    const query: any = {};
    if (name) query.name = { $regex: name, $options: "i" };
    if (phone) query.phone = { $regex: phone, $options: "i" };
    if (mac) {
      const n = normalizeMac(mac);
      query.mac = n;
    }

    const records = await Record.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return Response.json({ records });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const lock = await ensureUnlocked();
  if (lock) return lock;

  try {
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const name = String(body?.name ?? "").trim();
    const mac = String(body?.mac ?? "").trim();
    const phone = String(body?.phone ?? "").trim();

    if (!name) return Response.json({ error: "Name is required" }, { status: 400 });
    if (!isValidMac(mac))
      return Response.json({ error: "Invalid MAC. Use 12 hex digits (colon/dash optional)." }, { status: 400 });
    if (!isValidPhone(phone))
      return Response.json({ error: "Invalid phone" }, { status: 400 });

    const record = new Record({
      name,
      mac: normalizeMac(mac),
      phone,
    });

    const created = await record.save();
    return Response.json({ record: created });
  } catch (error: any) {
    console.error("Database error:", error);
    if (error.code === 11000) {
      return Response.json({ error: "MAC address already exists" }, { status: 400 });
    }
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}
