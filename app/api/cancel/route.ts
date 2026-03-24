import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { appealId, email } = await req.json();
    if (!appealId || !email) return NextResponse.json({ error: "appealId and email required" }, { status: 400 });

    // Only cancel if it belongs to this email and isn't already resolved
    const result = await sql`
      UPDATE appeals SET status = 'cancelled'
      WHERE id = ${appealId} AND email = ${email}
      AND status NOT IN ('approved', 'cancelled')
      RETURNING id
    `;

    if (!result[0]) return NextResponse.json({ error: "Appeal not found or already resolved" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
