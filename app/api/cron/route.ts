import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { checkInboxForReply, submitAppeal } from "@/lib/submitAppeal";
import { generateAppeal } from "@/app/api/appeal/route";
import { sendStatusEmail } from "@/lib/sendNotification";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appeals = await sql`
    SELECT * FROM appeals WHERE status NOT IN ('approved', 'cancelled') AND inbox_id IS NOT NULL
  `;

  const RETRY_DELAY_MS = 20 * 60 * 60 * 1000; // 20 hours
  let processed = 0;

  for (const appeal of appeals) {
    try {
      const emailStatus = await checkInboxForReply(appeal.inbox_id);

      if (emailStatus === "approved") {
        await sql`UPDATE appeals SET status = 'approved' WHERE id = ${appeal.id}`;
        await sendStatusEmail(appeal.email, appeal.username, "approved");
      } else if (emailStatus === "rejected") {
        const lastAttempt = Number(appeal.last_attempt ?? 0);
        if (Date.now() - lastAttempt < RETRY_DELAY_MS) {
          processed++;
          continue;
        }
        const newLetter = await generateAppeal(appeal.username, appeal.extra_info ?? "");
        const submission = await submitAppeal(appeal.username, appeal.inbox_email, newLetter);
        const newAttempts = (appeal.attempts ?? 0) + 1;
        await sql`
          UPDATE appeals SET status = ${submission.success ? "submitted" : "failed"},
          attempts = attempts + 1, last_attempt = ${Date.now()} WHERE id = ${appeal.id}
        `;
        await sql`INSERT INTO appeal_letters (appeal_id, letter, attempt_number, submitted_at)
          VALUES (${appeal.id}, ${newLetter}, ${newAttempts}, ${Date.now()})`;
        await sendStatusEmail(appeal.email, appeal.username, "rejected", newAttempts);
      }
      processed++;
    } catch (err) {
      console.error(`Failed to process appeal ${appeal.id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, processed });
}
