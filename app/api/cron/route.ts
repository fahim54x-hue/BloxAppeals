import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { checkRobloxReply } from "@/lib/checkEmail";
import { submitAppeal } from "@/lib/submitAppeal";
import { generateAppeal } from "@/app/api/appeal/route";
import { sendStatusEmail } from "@/lib/sendNotification";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appeals = await sql`
    SELECT * FROM appeals WHERE status NOT IN ('approved', 'cancelled')
  `;

  let processed = 0;

  const RETRY_DELAY_MS = 20 * 60 * 60 * 1000; // 20 hours

  for (const appeal of appeals) {
    if (!appeal.app_password) continue;
    try {
      const emailStatus = await checkRobloxReply(appeal.email, appeal.app_password);

      if (emailStatus === "approved") {
        await sql`UPDATE appeals SET status = 'approved' WHERE id = ${appeal.id}`;
        await sendStatusEmail(appeal.email, appeal.username, "approved");
      } else if (emailStatus === "rejected") {
        // Only retry if 20 hours have passed since last attempt
        const lastAttempt = Number(appeal.last_attempt ?? 0);
        const timeSinceLast = Date.now() - lastAttempt;
        if (timeSinceLast < RETRY_DELAY_MS) {
          console.log(`Appeal ${appeal.id}: rejected but waiting for retry delay (${Math.round((RETRY_DELAY_MS - timeSinceLast) / 3600000)}h left)`);
          processed++;
          continue;
        }
        const newAppeal = await generateAppeal(appeal.username, appeal.extra_info);
        const submission = await submitAppeal(appeal.username, appeal.email, newAppeal, appeal.app_password);
        const newAttempts = (appeal.attempts ?? 0) + 1;
        await sql`
          UPDATE appeals SET status = ${submission.success ? "submitted" : "failed"},
          attempts = attempts + 1, last_attempt = ${Date.now()} WHERE id = ${appeal.id}
        `;
        await sql`INSERT INTO appeal_letters (appeal_id, letter, attempt_number, submitted_at) VALUES (${appeal.id}, ${newAppeal}, ${newAttempts}, ${Date.now()})`;
        await sendStatusEmail(appeal.email, appeal.username, "rejected", newAttempts);
      }
      processed++;
    } catch (err) {
      console.error(`Failed to process appeal ${appeal.id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, processed });
}
