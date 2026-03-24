import { NextResponse } from "next/server";
import sql, { initDb } from "@/lib/db";

export async function GET() {
  try {
    await initDb();
    const appeals = await sql`SELECT id, username, status, attempts, created_at FROM appeals ORDER BY created_at DESC`;

    const total = appeals.length;
    const active = appeals.filter(a => a.status === "submitted" || a.status === "pending").length;
    const approved = appeals.filter(a => a.status === "approved").length;
    const rejected = appeals.filter(a => a.status === "failed").length;
    const appealsSent = appeals.reduce((sum, a) => sum + (a.attempts || 0), 0);

    return NextResponse.json({ appeals, stats: { total, active, approved, rejected, appealsSent } });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
