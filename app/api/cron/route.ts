import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { checkRobloxReply } from "@/lib/checkEmail";
import { submitAppeal } from "@/lib/submitAppeal";
import { generateAppeal } from "@/app/api/appeal/route";

// Vercel cron secret to prevent unauthorized calls
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all non-resolved appeals
  const appeals = await sql`
    SELECT * FROM appeals WHERE status NOT IN ('approved', 'cancelled')
  `;

  let processed = 0;

  for (const appeal of appeals) {
    if (!appeal.app_password) continue;

    try {
      const emailStatus = await checkRobloxReply(appeal.email, appeal.app_password);

      if (emailStatus === "approved") {
        await sql`UPDATE appeals SET status = 'approved' WHERE id = ${appeal.id}`;
      } else if (emailStatus === "rejected") {
        const newAppeal = await generateAppeal(appeal.username, appeal.extra_info);
        const submission = await submitAppeal(appeal.username, appeal.email, newAppeal);
        await sql`
          UPDATE appeals SET status = ${submission.success ? "submitted" : "failed"},
          attempts = attempts + 1, last_attempt = ${Date.now()} WHERE id = ${appeal.id}
        `;
      }
      processed++;
    } catch (err) {
      console.error(`Failed to process appeal ${appeal.id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, processed });
}
