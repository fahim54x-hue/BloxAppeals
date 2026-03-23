import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import db from "@/lib/db";
import { checkRobloxReply } from "@/lib/checkEmail";
import { submitAppeal } from "@/lib/submitAppeal";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateAppeal(username: string, extraInfo: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `Write a professional and polite Roblox ban appeal letter for:
- Roblox Username: ${username}
- Ban Type: Enforcement ban (account linking / ban evasion false positive)
- Additional Info: ${extraInfo || "None"}

Make this appeal unique and different from previous attempts. Be respectful, sincere, and request a manual review.
3-4 paragraphs, no subject line.`,
      },
    ],
    max_tokens: 500,
  });
  return response.choices[0].message.content ?? "";
}

export async function POST(req: NextRequest) {
  try {
    const { appealId, appPassword } = await req.json();

    if (!appealId || !appPassword) {
      return NextResponse.json({ error: "appealId and appPassword required" }, { status: 400 });
    }

    const appeal = db.prepare("SELECT * FROM appeals WHERE id = ?").get(appealId) as {
      id: number;
      username: string;
      email: string;
      extra_info: string;
      status: string;
      attempts: number;
    } | undefined;

    if (!appeal) {
      return NextResponse.json({ error: "Appeal not found" }, { status: 404 });
    }

    if (appeal.status === "approved") {
      return NextResponse.json({ status: "approved", message: "Your account has been unbanned!" });
    }

    // Check inbox for Roblox reply
    const emailStatus = await checkRobloxReply(appeal.email, appPassword);

    if (emailStatus === "approved") {
      db.prepare("UPDATE appeals SET status = 'approved' WHERE id = ?").run(appealId);
      return NextResponse.json({ status: "approved", message: "Your account has been unbanned!" });
    }

    if (emailStatus === "rejected") {
      // Auto-retry with a fresh appeal
      const newAppeal = await generateAppeal(appeal.username, appeal.extra_info);
      const submission = await submitAppeal(appeal.username, appeal.email, newAppeal);

      db.prepare(
        "UPDATE appeals SET status = ?, attempts = attempts + 1, last_attempt = ? WHERE id = ?"
      ).run(submission.success ? "submitted" : "failed", Date.now(), appealId);

      return NextResponse.json({
        status: "retried",
        message: `Appeal was rejected. A new appeal has been submitted automatically (attempt #${appeal.attempts + 1}).`,
        appealText: newAppeal,
      });
    }

    // Still pending
    return NextResponse.json({
      status: "pending",
      message: "No response from Roblox yet. Check back later.",
      attempts: appeal.attempts,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
