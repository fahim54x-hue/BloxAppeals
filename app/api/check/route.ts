import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { checkRobloxReply } from "@/lib/checkEmail";
import { submitAppeal } from "@/lib/submitAppeal";
import { generateAppeal } from "@/app/api/appeal/route";
import { sendStatusEmail } from "@/lib/sendNotification";

export async function POST(req: NextRequest) {
  try {
    const { appealId, appPassword } = await req.json();
    if (!appealId || !appPassword) return NextResponse.json({ error: "appealId and appPassword required" }, { status: 400 });

    const rows = await sql`SELECT * FROM appeals WHERE id = ${appealId}`;
    const appeal = rows[0];
    if (!appeal) return NextResponse.json({ error: "Appeal not found" }, { status: 404 });
    if (appeal.status === "approved") return NextResponse.json({ status: "approved", message: "Your account has been unbanned!" });

    const emailStatus = await checkRobloxReply(appeal.email, appPassword);
    if (emailStatus === "approved") {
      await sql`UPDATE appeals SET status = 'approved' WHERE id = ${appealId}`;
      await sendStatusEmail(appeal.email, appeal.username, "approved");
      return NextResponse.json({ status: "approved", message: "Your account has been unbanned!" });
    }
    if (emailStatus === "rejected") {
      const newLetter = await generateAppeal(appeal.username, appeal.extra_info ?? "");
      const submission = await submitAppeal(appeal.username, appeal.email, newLetter, appPassword);
      const newAttempts = (appeal.attempts ?? 0) + 1;
      await sql`UPDATE appeals SET status = ${submission.success ? "submitted" : "failed"},
        attempts = attempts + 1, last_attempt = ${Date.now()} WHERE id = ${appealId}`;
      await sql`INSERT INTO appeal_letters (appeal_id, letter, attempt_number, submitted_at)
        VALUES (${appealId}, ${newLetter}, ${newAttempts}, ${Date.now()})`;
      await sendStatusEmail(appeal.email, appeal.username, "rejected", newAttempts);
      return NextResponse.json({ status: "retried", message: `Rejected. New appeal submitted (attempt #${newAttempts}).` });
    }
    return NextResponse.json({ status: "pending", message: "No response from Roblox yet.", attempts: appeal.attempts });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
