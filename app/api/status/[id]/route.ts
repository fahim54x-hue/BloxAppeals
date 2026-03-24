import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await sql`
      SELECT username, status, attempts, created_at, last_attempt
      FROM appeals WHERE id = ${Number(id)}
    `;
    if (!rows[0]) return NextResponse.json({ error: "Appeal not found" }, { status: 404 });

    // Return public info only — no email or app_password
    const { username, status, attempts, created_at, last_attempt } = rows[0];
    return NextResponse.json({ username, status, attempts, created_at, last_attempt });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
