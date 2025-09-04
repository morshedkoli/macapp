import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import Record from "@/lib/models/Record";
import mongoose from "mongoose";

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

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const lock = await ensureUnlocked();
  if (lock) return lock;

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return Response.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const record = await Record.findById(params.id).lean();
    if (!record) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ record });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const lock = await ensureUnlocked();
  if (lock) return lock;

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return Response.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const name = body?.name !== undefined ? String(body.name).trim() : undefined;
    const mac = body?.mac !== undefined ? String(body.mac).trim() : undefined;
    const phone = body?.phone !== undefined ? String(body.phone).trim() : undefined;

    const updateData: any = {};
    if (name !== undefined) {
      if (!name) return Response.json({ error: "Name is required" }, { status: 400 });
      updateData.name = name;
    }
    if (mac !== undefined) {
      if (!isValidMac(mac))
        return Response.json({ error: "Invalid MAC" }, { status: 400 });
      updateData.mac = normalizeMac(mac);
    }
    if (phone !== undefined) {
      if (!isValidPhone(phone))
        return Response.json({ error: "Invalid phone" }, { status: 400 });
      updateData.phone = phone;
    }

    const updated = await Record.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return Response.json({ error: "Record not found" }, { status: 404 });
    }

    return Response.json({ record: updated });
  } catch (error: any) {
    console.error("Database error:", error);
    if (error.code === 11000) {
      return Response.json({ error: "MAC address already exists" }, { status: 400 });
    }
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const lock = await ensureUnlocked();
  if (lock) return lock;

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return Response.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const deleted = await Record.findByIdAndDelete(params.id).lean();
    if (!deleted) {
      return Response.json({ error: "Record not found" }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}
