import { NextRequest, NextResponse } from "next/server";
import sql, { initDb } from "@/lib/db";

// Public global stats (no email required)
export async function GET() {
  try {
    await initDb();
    const rows = await sql`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved,
        COUNT(*) FILTER (WHERE created_at > EXTRACT(EPOCH FROM NOW())::BIGINT - 86400) AS today
      FROM appeals
    `;
    const r = rows[0];
    return NextResponse.json({
      total: Number(r.total),
      approved: Number(r.approved),
      today: Number(r.today),
    });
  } catch {
    return NextResponse.json({ total: 0, approved: 0, today: 0 });
  }
}

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
