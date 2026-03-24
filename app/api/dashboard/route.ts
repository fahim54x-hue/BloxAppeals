import { NextRequest, NextResponse } from "next/server";
import sql, { initDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const appeals = await sql`
      SELECT id, username, status, attempts, created_at
      FROM appeals WHERE email = ${email}
      ORDER BY created_at DESC
    `;

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
