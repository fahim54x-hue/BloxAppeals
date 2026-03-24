import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { email } = await req.json();
    const { id } = await params;
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    // Verify the appeal belongs to this email
    const appeal = await sql`SELECT id FROM appeals WHERE id = ${Number(id)} AND email = ${email}`;
    if (!appeal[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const letters = await sql`
      SELECT id, letter, attempt_number, submitted_at
      FROM appeal_letters WHERE appeal_id = ${Number(id)}
      ORDER BY attempt_number ASC
    `;

    return NextResponse.json({ letters });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
